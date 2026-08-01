# UP403 Research API — Query Examples

## 1. Basic Queries

### 1.1 Get API Root

```bash
curl https://thebreakdown.in/api/up403/v1
```

### 1.2 List First Page of Constituencies

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?page=1&limit=20"
```

### 1.3 Get Single Constituency

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies/UP-AC-001"
```

---

## 2. Filtering

### 2.1 By District

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?district=Saharanpur"
```

### 2.2 By Division

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?division=Meerut"
```

### 2.3 By Region

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?region=Bundelkhand"
```

### 2.4 By Reservation Type

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?reservation=SC"
```

### 2.5 By Current Party

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?party=BJP"
```

### 2.6 By DNA Classification

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?political_dna=SAFE"
```

### 2.7 By Competitiveness

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?competitiveness=COMPETITIVE"
```

### 2.8 Combined Filters

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies?district=Gautam+Buddha+Nagar&party=BJP&competitiveness=SAFE"
```

---

## 3. Search

### 3.1 Search by Name

```bash
curl "https://thebreakdown.in/api/up403/v1/search?q=Behat"
```

### 3.2 Search by MLA

```bash
curl "https://thebreakdown.in/api/up403/v1/search?q=Yogi+Adityanath"
```

### 3.3 Search by Party

```bash
curl "https://thebreakdown.in/api/up403/v1/search?q=BJP"
```

---

## 4. People

### 4.1 List All MLAs/MPs

```bash
curl "https://thebreakdown.in/api/up403/v1/people?page=1&limit=50"
```

### 4.2 Get Person Profile

```bash
curl "https://thebreakdown.in/api/up403/v1/people/Yogi%20Adityanath"
```

```bash
curl "https://thebreakdown.in/api/up403/v1/people/person:Akhilesh%20Yadav"
```

---

## 5. Elections

### 5.1 Election Overview

```bash
curl "https://thebreakdown.in/api/up403/v1/elections"
```

### 5.2 Results for 2022

```bash
curl "https://thebreakdown.in/api/up403/v1/elections/2022"
```

### 5.3 Results for 2017

```bash
curl "https://thebreakdown.in/api/up403/v1/elections/2017"
```

### 5.4 Results for 2012

```bash
curl "https://thebreakdown.in/api/up403/v1/elections/2012"
```

### 5.5 2024 Lok Sabha Overlay

```bash
curl "https://thebreakdown.in/api/up403/v1/elections/2024-overlay"
```

### 5.6 Filter Elections by Constituency

```bash
curl "https://thebreakdown.in/api/up403/v1/elections?constituency=UP-AC-001"
```

---

## 6. Knowledge Graph

### 6.1 Full Graph

```bash
curl "https://thebreakdown.in/api/up403/v1/graph"
```

### 6.2 Per-Constituency Graph

```bash
curl "https://thebreakdown.in/api/up403/v1/graph/UP-AC-001"
```

---

## 7. Timeline

```bash
curl "https://thebreakdown.in/api/up403/v1/timeline/UP-AC-001"
```

---

## 8. Filter Options

```bash
curl "https://thebreakdown.in/api/up403/v1/filter/options"
```

---

## 9. Compare

### 9.1 Compare Two Constituencies (All Categories)

```bash
curl "https://thebreakdown.in/api/up403/v1/compare?ids=UP-AC-001,UP-AC-050"
```

### 9.2 Compare Three Constituencies (Selected Categories)

```bash
curl "https://thebreakdown.in/api/up403/v1/compare?ids=UP-AC-001,UP-AC-050,UP-AC-100&categories=election_history,political_dna,current_representation"
```

---

## 10. Analytics

```bash
curl "https://thebreakdown.in/api/up403/v1/analytics"
```

---

## 11. Provenance

Include provenance metadata in any constituency response:

```bash
curl "https://thebreakdown.in/api/up403/v1/constituencies/UP-AC-001?include=provenance"
```

```bash
curl "https://thebreakdown.in/api/up403/v1/elections/2022?include=provenance"
```

```bash
curl "https://thebreakdown.in/api/up403/v1/search?q=Saharanpur&include=provenance"
```

---

## 12. Pagination

```bash
# Page 1
curl "https://thebreakdown.in/api/up403/v1/constituencies?page=1&limit=50"

# Page 2
curl "https://thebreakdown.in/api/up403/v1/constituencies?page=2&limit=50"

# Last page
curl "https://thebreakdown.in/api/up403/v1/constituencies?page=9&limit=50"
```

---

## 13. Node.js Client Example

```javascript
const BASE = 'https://thebreakdown.in/api/up403/v1';

async function getConstituency(id) {
  const res = await fetch(`${BASE}/constituencies/${id}`);
  const data = await res.json();
  return data;
}

async function compareConstituencies(ids) {
  const res = await fetch(`${BASE}/compare?ids=${ids.join(',')}`);
  const data = await res.json();
  return data;
}

// Usage
const behat = await getConstituency('UP-AC-001');
const comparison = await compareConstituencies(['UP-AC-001', 'UP-AC-050']);
```

## 14. Python Client Example

```python
import requests

BASE = "https://thebreakdown.in/api/up403/v1"

def get_constituency(canonical_id):
    res = requests.get(f"{BASE}/constituencies/{canonical_id}")
    return res.json()

def search(query):
    res = requests.get(f"{BASE}/search", params={"q": query})
    return res.json()

# Usage
behat = get_constituency("UP-AC-001")
results = search("Saharanpur")
```
