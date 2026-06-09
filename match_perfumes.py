import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"
django.setup()
import pandas as pd
from rapidfuzz import fuzz

from parfumello.models import Perfume


def normalize(s):
    s = str(s).lower().replace("-", " ").strip()
    s = s.replace(" edp", " eau de parfum")
    s = s.replace(" edt", " eau de toilette")
    s = s.replace(" edc", " eau de cologne")
    return s


# Încarcă CSV-ul
df = pd.read_csv(
    "fra_cleanedcopy.csv", encoding="latin-1", sep=";", on_bad_lines="skip"
)
df = df.dropna(subset=["Perfume", "Brand"])
df = df.reset_index(drop=True)
df["name_norm"] = df["Perfume"].apply(normalize)
df["brand_norm"] = df["Brand"].apply(normalize)

django_perfumes = Perfume.objects.filter(kaggle_index=None).select_related("brand").all()

matched = 0
unmatched = []

for perfume in django_perfumes:
    name_dj = normalize(perfume.brand.name + " " + perfume.name)  # ← adaugi brandul
    brand_dj = normalize(perfume.brand.name)

    best_score = 0
    best_idx = None

    brand_mask = df["brand_norm"].apply(lambda b: fuzz.ratio(b, brand_dj) > 70)
    candidates = df[brand_mask]

    if candidates.empty:
        unmatched.append(f"{perfume.name} - brand negasit")
        continue

    for idx, row in candidates.iterrows():
        score = fuzz.token_sort_ratio(row["name_norm"], name_dj)
        if score > best_score:
            best_score = score
            best_idx = idx

    if best_score >= 70:
        perfume.kaggle_index = best_idx
        perfume.save()
        matched += 1
        print(f"✓ {perfume.name} → {df.loc[best_idx, 'Perfume']} (scor: {best_score})")
    else:
        unmatched.append(
            f"{perfume.name} (best scor: {best_score} → {df.loc[best_idx, 'Perfume']})"
        )

print(f"\nMatched: {matched}/{django_perfumes.count()}")
if unmatched:
    print(f"Unmatched ({len(unmatched)}):")
    for u in unmatched:
        print(f"  ✗ {u}")
