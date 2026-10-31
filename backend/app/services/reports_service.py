import os
import csv
import io
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.models.wedding import Wedding
from app.models.finance import ClientPayment, VendorPayment, Expense, TimeEntry, ClientPaymentMilestone
from app.models.proposal_contract import SigningToken
from app.core.config import settings

class ReportsService:
    @staticmethod
    def get_season_profitability(db: Session, season_year: int = 2026) -> Dict[str, Any]:
        weddings = db.query(Wedding).order_by(desc(Wedding.wedding_date_start)).all()

        total_season_revenue = 0.0
        total_season_vendor_expenses = 0.0
        total_season_team_costs = 0.0
        total_season_expenses = 0.0
        total_season_profit = 0.0

        wedding_reports = []

        for w in weddings:
            # Revenue: Client payments received
            rev = float(sum(cp.amount for cp in w.payments)) if w.payments else 0.0
            # If no payments recorded yet, default to contracted budget if completed or active
            if rev == 0.0 and w.status == "Completed":
                rev = float(w.agreed_budget)

            # Vendor expenses
            v_costs = float(sum(vp.amount for vp in w.vendor_payments)) if w.vendor_payments else 0.0

            # Direct agency expenses
            dir_exp = float(sum(e.amount for e in w.expenses)) if w.expenses else 0.0

            # Internal team costs
            team_cost = float(sum(float(te.hours) * float(te.hourly_rate) for te in w.time_entries)) if w.time_entries else 0.0

            # Totals
            total_cost = v_costs + dir_exp + team_cost
            net_profit = rev - total_cost
            margin_pct = (net_profit / rev * 100) if rev > 0 else 0.0

            is_loss_making = net_profit < 0

            total_season_revenue += rev
            total_season_vendor_expenses += v_costs
            total_season_team_costs += team_cost
            total_season_expenses += dir_exp
            total_season_profit += net_profit

            wedding_reports.append({
                "wedding_id": w.id,
                "wedding_number": w.wedding_number,
                "couple_title": w.couple_title,
                "status": w.status,
                "wedding_date": w.wedding_date_start.isoformat(),
                "destination": w.destination,
                "package_type": w.package_type,
                "revenue": rev,
                "vendor_expenses": v_costs,
                "team_costs": team_cost,
                "direct_expenses": dir_exp,
                "total_cost": total_cost,
                "net_profit": net_profit,
                "margin_percentage": round(margin_pct, 1),
                "is_loss_making": is_loss_making
            })

        # Sort ranked by profit descending
        wedding_reports.sort(key=lambda x: x["net_profit"], reverse=True)

        overall_margin = (total_season_profit / total_season_revenue * 100) if total_season_revenue > 0 else 0.0

        # Outstanding and receivables
        all_milestones = db.query(ClientPaymentMilestone).all()
        now = datetime.utcnow()
        thirty_days_later = now + timedelta(days=30)
        due_next_30_days = sum(
            float(m.expected_amount) for m in all_milestones
            if m.status != "Paid" and now <= m.due_date <= thirty_days_later
        )

        return {
            "season_year": season_year,
            "total_weddings": len(weddings),
            "total_revenue": total_season_revenue,
            "total_vendor_expenses": total_season_vendor_expenses,
            "total_team_costs": total_season_team_costs,
            "total_direct_expenses": total_season_expenses,
            "total_profit": total_season_profit,
            "overall_margin_percentage": round(overall_margin, 1),
            "receivables_due_next_30_days": due_next_30_days,
            "weddings_ranking": wedding_reports
        }

    @staticmethod
    def export_csv(db: Session) -> str:
        data = ReportsService.get_season_profitability(db)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Wedding Number", "Couple", "Status", "Destination",
            "Revenue (INR)", "Vendor Costs (INR)", "Team Costs (INR)",
            "Direct Expenses (INR)", "Total Cost (INR)", "Net Profit (INR)",
            "Margin (%)", "Financial State"
        ])

        for row in data["weddings_ranking"]:
            writer.writerow([
                row["wedding_number"],
                row["couple_title"],
                row["status"],
                row["destination"],
                f"{row['revenue']:.2f}",
                f"{row['vendor_expenses']:.2f}",
                f"{row['team_costs']:.2f}",
                f"{row['direct_expenses']:.2f}",
                f"{row['total_cost']:.2f}",
                f"{row['net_profit']:.2f}",
                f"{row['margin_percentage']}%",
                "LOSS-MAKING" if row["is_loss_making"] else "Profitable"
            ])

        return output.getvalue()

    @staticmethod
    def export_pdf(db: Session, output_path: str):
        data = ReportsService.get_season_profitability(db)
        c = canvas.Canvas(output_path, pagesize=landscape(letter))
        width, height = landscape(letter)

        # Header Banner
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.rect(0, height - 1.1 * inch, width, 1.1 * inch, stroke=0, fill=1)

        c.setFillColor(colors.HexColor("#FAF8F5"))
        c.setFont("Helvetica-Bold", 16)
        c.drawString(0.5 * inch, height - 0.65 * inch, "THE ROYAL KNOT – SEASON PROFITABILITY & EXECUTIVE AUDIT")
        c.setFont("Helvetica", 9)
        c.drawString(0.5 * inch, height - 0.9 * inch, f"Generated: {datetime.utcnow().strftime('%B %d, %Y')} | Currency: Indian Rupee (INR)")

        # Executive Metrics Box
        c.setFillColor(colors.HexColor("#F4EFEA"))
        c.rect(0.5 * inch, height - 1.9 * inch, width - 1.0 * inch, 0.65 * inch, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(0.7 * inch, height - 1.55 * inch, f"Total Revenue: ₹{data['total_revenue']:,.2f}")
        c.drawString(3.5 * inch, height - 1.55 * inch, f"Total Profit: ₹{data['total_profit']:,.2f}")
        c.drawString(6.5 * inch, height - 1.55 * inch, f"Margin: {data['overall_margin_percentage']}%")
        c.drawString(8.5 * inch, height - 1.55 * inch, f"Next 30 Days Due: ₹{data['receivables_due_next_30_days']:,.2f}")

        # Table Header
        y = height - 2.3 * inch
        c.setFont("Helvetica-Bold", 9)
        c.drawString(0.5 * inch, y, "Wedding / Couple")
        c.drawString(2.5 * inch, y, "Destination")
        c.drawString(3.8 * inch, y, "Revenue (₹)")
        c.drawString(5.1 * inch, y, "Vendor Cost (₹)")
        c.drawString(6.4 * inch, y, "Team (₹)")
        c.drawString(7.5 * inch, y, "Profit (₹)")
        c.drawString(8.8 * inch, y, "Margin")
        c.drawString(9.7 * inch, y, "Status")

        c.setStrokeColor(colors.HexColor("#CCCCCC"))
        c.line(0.5 * inch, y - 4, width - 0.5 * inch, y - 4)

        y -= 18
        c.setFont("Helvetica", 8)
        for row in data["weddings_ranking"]:
            if row["is_loss_making"]:
                c.setFillColor(colors.HexColor("#B91C1C")) # Red for loss-making
            else:
                c.setFillColor(colors.HexColor("#1A1F2C"))

            c.drawString(0.5 * inch, y, f"{row['wedding_number']} - {row['couple_title'][:18]}")
            c.drawString(2.5 * inch, y, row["destination"])
            c.drawString(3.8 * inch, y, f"₹{row['revenue']:,.0f}")
            c.drawString(5.1 * inch, y, f"₹{row['vendor_expenses']:,.0f}")
            c.drawString(6.4 * inch, y, f"₹{row['team_costs']:,.0f}")
            c.drawString(7.5 * inch, y, f"₹{row['net_profit']:,.0f}")
            c.drawString(8.8 * inch, y, f"{row['margin_percentage']}%")
            c.drawString(9.7 * inch, y, "LOSS" if row["is_loss_making"] else "PROFIT")
            y -= 16

        c.save()

    @staticmethod
    def create_shareable_report_token(db: Session) -> SigningToken:
        token_str = str(uuid.uuid4()).replace("-", "")
        expires_at = datetime.utcnow() + timedelta(days=3)

        token = SigningToken(
            token=token_str,
            target_type="reports_share",
            target_id="season-2026",
            recipient_email="shareholder@royalknot.in",
            recipient_name="Executive Board",
            expires_at=expires_at
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token
