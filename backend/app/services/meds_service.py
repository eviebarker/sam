from datetime import datetime
from backend.app.db.med_queries import get_due_active, bump_active, log_action

REPEAT_MINUTES = 5

def check_and_fire_due_meds():
    now = datetime.now().isoformat(timespec="seconds")
    row = get_due_active(now)
    if not row:
        return None

    med_name = row["med_name"]
    log_action(med_name, "fired")
    # schedule next nag in 5 minutes
    bump_active(row["id"], REPEAT_MINUTES)

    # This is what we will push to the UI in the next step.
    return {
        "type": "meds_due",
        "message": f"Time for your meds, Sam.",
        "med_name": med_name,
    }
