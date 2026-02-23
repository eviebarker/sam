import json
import sqlite3

def list_foodhub_by_category(conn: sqlite3.Connection, category_id: int) -> list[dict]:
    rows = conn.execute(
        """
        SELECT
          id,
          category_id,
          sort_order,
          name,
          tagline,
          time_prep_min,
          time_cook_min,
          time_total_min,
          link,
          image_url,
          cuisine_region,
          time_band,
          activity_level,
          health_vibe,
          weight_class,
          rating,
          last_accessed_at,
          tags,
          ingredients,
          steps
        FROM foodhub
        WHERE category_id = ?
        ORDER BY sort_order ASC, id ASC;
        """,
        (category_id,),
    ).fetchall()
    results: list[dict] = []
    for row in rows:
        results.append(
            {
                "id": row["id"],
                "category_id": row["category_id"],
                "sort_order": row["sort_order"],
                "name": row["name"],
                "tagline": row["tagline"],
                "time_prep_min": row["time_prep_min"],
                "time_cook_min": row["time_cook_min"],
                "time_total_min": row["time_total_min"],
                "link": row["link"],
                "image_url": row["image_url"],
                "cuisine_region": row["cuisine_region"],
                "time_band": row["time_band"],
                "activity_level": row["activity_level"],
                "health_vibe": row["health_vibe"],
                "weight_class": row["weight_class"],
                "rating": row["rating"],
                "last_accessed_at": row["last_accessed_at"],
                "tags": json.loads(row["tags"] or "[]"),
                "ingredients": json.loads(row["ingredients"] or "[]"),
                "steps": json.loads(row["steps"] or "[]"),
            }
        )
    return results

def list_foodhub_all(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT
          id,
          category_id,
          sort_order,
          name,
          tagline,
          time_prep_min,
          time_cook_min,
          time_total_min,
          link,
          image_url,
          cuisine_region,
          time_band,
          activity_level,
          health_vibe,
          weight_class,
          rating,
          last_accessed_at,
          tags,
          ingredients,
          steps
        FROM foodhub
        ORDER BY category_id ASC, sort_order ASC, id ASC;
        """
    ).fetchall()
    results: list[dict] = []
    for row in rows:
        results.append(
            {
                "id": row["id"],
                "category_id": row["category_id"],
                "sort_order": row["sort_order"],
                "name": row["name"],
                "tagline": row["tagline"],
                "time_prep_min": row["time_prep_min"],
                "time_cook_min": row["time_cook_min"],
                "time_total_min": row["time_total_min"],
                "link": row["link"],
                "image_url": row["image_url"],
                "cuisine_region": row["cuisine_region"],
                "time_band": row["time_band"],
                "activity_level": row["activity_level"],
                "health_vibe": row["health_vibe"],
                "weight_class": row["weight_class"],
                "rating": row["rating"],
                "last_accessed_at": row["last_accessed_at"],
                "tags": json.loads(row["tags"] or "[]"),
                "ingredients": json.loads(row["ingredients"] or "[]"),
                "steps": json.loads(row["steps"] or "[]"),
            }
        )
    return results

def set_foodhub_rating(conn: sqlite3.Connection, recipe_id: int, rating: int) -> None:
    conn.execute(
        "UPDATE foodhub SET rating = ? WHERE id = ?;",
        (rating, recipe_id),
    )

def set_foodhub_accessed(conn: sqlite3.Connection, recipe_id: int, ts: str) -> None:
    conn.execute(
        "UPDATE foodhub SET last_accessed_at = ? WHERE id = ?;",
        (ts, recipe_id),
    )
