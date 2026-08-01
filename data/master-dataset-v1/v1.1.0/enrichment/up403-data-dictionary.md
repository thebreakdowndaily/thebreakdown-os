# UP403 Data Dictionary — v1.0

**Dataset Version:** 1.0.1 | **Enrichment Version:** 1.1.0

UP403 Constituency Intelligence Dataset — Data Dictionary & Schema Reference

**Total Fields:** 150

## Field Categories

| Category | Count | Description |
|----------|-------|-------------|
| **CLASSIFICATION** | 4 | Administrative classification: regions, zones, reservation categories |
| **COMPETITIVENESS** | 39 | Electoral competitiveness indicators, DNA classification, derived scores |
| **DATA_QUALITY** | 4 | Availability status annotations for each data category |
| **DEMOGRAPHICS** | 13 | Census 2011 data at AC level. Currently NOT_AVAILABLE — requires GIS pipeline. |
| **DEVELOPMENT** | 6 | Flagshhip scheme data from UP403-DATA-11 |
| **ECONOMY** | 11 | Economic indicators. NOT_AVAILABLE at AC level. |
| **ELECTIONS** | 44 | Election results from ECI 2012, 2017, 2022 Vidhan Sabha + 2024 Lok Sabha |
| **GEOGRAPHY** | 8 | Geographic attributes (area, terrain, rivers). Mostly NOT_AVAILABLE. |
| **GOVERNANCE** | 4 | Governance, environmental, and disaster risk data from UP403-DATA-10 |
| **IDENTIFICATION** | 5 | Canonical identifiers and official names from ECI Delimitation 2008 |
| **INFRASTRUCTURE** | 7 | Infrastructure indicators. NOT_AVAILABLE at AC level. |
| **METADATA** | 5 | Dataset versioning, timestamps, and provenance tracking |
| **Total** | **150** | |

## Full Field Reference

| # | Category | Field Name | Type | Definition | Status |
|---|----------|------------|------|------------|--------|
| 1 | CLASSIFICATION | `district` | str | District name per UP Revenue Department (ECI Delimitation 2008) | ACTIVE |
| 2 | CLASSIFICATION | `division` | str | Administrative division name per UP Revenue Department | ACTIVE |
| 3 | CLASSIFICATION | `region` | str | Geographic region classification (Western/Central/Eastern/Bundelkhand) | ACTIVE |
| 4 | CLASSIFICATION | `reservation_type` | str | Reservation category per ECI Delimitation 2008 (SC/ST/GENERAL) | ACTIVE |
| 5 | COMPETITIVENESS | `competitiveness_avg_margin_pct` | float | Average victory margin across all elections | ACTIVE |
| 6 | COMPETITIVENESS | `competitiveness_class` | str | Overall competitiveness classification | ACTIVE |
| 7 | COMPETITIVENESS | `competitiveness_thresholds` | str | Threshold definitions used for competitiveness classification | ACTIVE |
| 8 | COMPETITIVENESS | `competitiveness_trend` | str | Competitiveness trend direction (WIDENING/NARROWING/STABLE) | ACTIVE |
| 9 | COMPETITIVENESS | `derived_bjp_competitiveness_score` | float | BJP-specific competitiveness score (lower = BJP weaker) | ACTIVE |
| 10 | COMPETITIVENESS | `derived_development_coverage_index` | float | Development coverage index | ACTIVE |
| 11 | COMPETITIVENESS | `derived_electoral_competitiveness_score` | float | Composite electoral competitiveness score (0.0-1.0) | ACTIVE |
| 12 | COMPETITIVENESS | `derived_governance_issue_density` | float | Governance issue density score | ACTIVE |
| 13 | COMPETITIVENESS | `derived_party_persistence_score` | float | Party persistence score (higher = same party more often) | ACTIVE |
| 14 | COMPETITIVENESS | `derived_representation_continuity_score` | float | Representation continuity score | ACTIVE |
| 15 | COMPETITIVENESS | `derived_seat_volatility` | float | Scalar seat volatility score (higher = more volatile) | ACTIVE |
| 16 | COMPETITIVENESS | `derived_sp_competitiveness_score` | float | SP-specific competitiveness score (lower = SP weaker) | ACTIVE |
| 17 | COMPETITIVENESS | `derived_winner_persistence_score` | float | Winner persistence score (higher = same winner more often) | ACTIVE |
| 18 | COMPETITIVENESS | `dna_algorithm_version` | str | Version of the DNA classification algorithm used | ACTIVE |
| 19 | COMPETITIVENESS | `dna_classification` | str | DNA classification of the constituency (CONTENTED/SAFE/LEAN etc) | ACTIVE |
| 20 | COMPETITIVENESS | `dna_confidence` | str | Confidence level in the DNA classification (HIGH/MEDIUM/LOW) | ACTIVE |
| 21 | COMPETITIVENESS | `dna_reasoning` | str | Human-readable reasoning behind the DNA classification | ACTIVE |
| 22 | COMPETITIVENESS | `dna_sub_type` | str | DNA sub-type describing the competitive dynamic | ACTIVE |
| 23 | COMPETITIVENESS | `most_persistent_party` | str | Party with most wins across all elections | ACTIVE |
| 24 | COMPETITIVENESS | `party_continuity_score` | float | Party continuity score (proportion of consecutive same-party wins) | ACTIVE |
| 25 | COMPETITIVENESS | `party_turnover_count` | int | Number of party changes across consecutive elections | ACTIVE |
| 26 | COMPETITIVENESS | `party_volatility_index` | int | Index measuring party-level volatility across elections | ACTIVE |
| 27 | COMPETITIVENESS | `seat_volatility_index` | int | Index measuring seat-level volatility across elections | ACTIVE |
| 28 | COMPETITIVENESS | `sociology_dominant_party_avg_vote_share` | float | Average vote share of the dominant party | ACTIVE |
| 29 | COMPETITIVENESS | `sociology_dominant_party_by_avg_share` | str | Party with highest average vote share across elections | ACTIVE |
| 30 | COMPETITIVENESS | `sociology_has_repeat_winner` | bool | Whether any candidate has won the seat multiple times | ACTIVE |
| 31 | COMPETITIVENESS | `sociology_historical_behaviour_summary` | str | Narrative summary of historical voting behaviour | ACTIVE |
| 32 | COMPETITIVENESS | `sociology_most_persistent_party` | str | Party with most appearances in election results | ACTIVE |
| 33 | COMPETITIVENESS | `sociology_party_persistent_consecutive_wins` | int | Consecutive wins by the most persistent party | ACTIVE |
| 34 | COMPETITIVENESS | `trajectory_formula` | str | Algorithm description used to compute trajectory | ACTIVE |
| 35 | COMPETITIVENESS | `trajectory_steps_compact` | str | Compact notation of electoral trajectory step by step | ACTIVE |
| 36 | COMPETITIVENESS | `trajectory_total_shifts` | int | Total number of winner changes across all observed elections | ACTIVE |
| 37 | COMPETITIVENESS | `trajectory_unique_parties` | int | Number of distinct parties that have won this seat | ACTIVE |
| 38 | COMPETITIVENESS | `unique_parties_across_elections` | int | Number of unique parties that have won across all elections | ACTIVE |
| 39 | COMPETITIVENESS | `unique_winners_across_elections` | int | Number of unique winning candidates across all elections | ACTIVE |
| 40 | COMPETITIVENESS | `victory_margin_pct_2012` | float | Victory margin (percentage of valid votes between winner and runner-up) in 2012 | ACTIVE |
| 41 | COMPETITIVENESS | `victory_margin_pct_2017` | float | Victory margin percentage in 2017 election | ACTIVE |
| 42 | COMPETITIVENESS | `victory_margin_pct_2022` | float | Victory margin percentage in 2022 election | ACTIVE |
| 43 | COMPETITIVENESS | `winner_continuity_score` | float | Winner continuity score (proportion of consecutive same-candidate wins) | ACTIVE |
| 44 | DATA_QUALITY | `demographics_availability_status` | str | Overall availability status for demographic data | ACTIVE |
| 45 | DATA_QUALITY | `economy_availability_status` | str | Overall availability status for economic data | ACTIVE |
| 46 | DATA_QUALITY | `governance_availability_status` | str | Availability status for governance data | ACTIVE |
| 47 | DATA_QUALITY | `infrastructure_availability_status` | str | Availability status for infrastructure data | ACTIVE |
| 48 | DEMOGRAPHICS | `female_literacy_rate` | NoneType | Female literacy rate percentage | NOT_AVAILABLE |
| 49 | DEMOGRAPHICS | `male_literacy_rate` | NoneType | Male literacy rate percentage | NOT_AVAILABLE |
| 50 | DEMOGRAPHICS | `overall_literacy_rate` | NoneType | Overall literacy rate percentage | NOT_AVAILABLE |
| 51 | DEMOGRAPHICS | `population_reference_year` | NoneType | Reference year for population data | NOT_AVAILABLE |
| 52 | DEMOGRAPHICS | `population_value` | NoneType | Total population (Census 2011 projected to AC level) | NOT_AVAILABLE |
| 53 | DEMOGRAPHICS | `rural_percentage` | NoneType | Rural population percentage | NOT_AVAILABLE |
| 54 | DEMOGRAPHICS | `rural_population` | NoneType | Rural population count | NOT_AVAILABLE |
| 55 | DEMOGRAPHICS | `sc_percentage` | NoneType | Scheduled Caste population percentage | NOT_AVAILABLE |
| 56 | DEMOGRAPHICS | `sc_population` | NoneType | Scheduled Caste population count | NOT_AVAILABLE |
| 57 | DEMOGRAPHICS | `st_percentage` | NoneType | Scheduled Tribe population percentage | NOT_AVAILABLE |
| 58 | DEMOGRAPHICS | `st_population` | NoneType | Scheduled Tribe population count | NOT_AVAILABLE |
| 59 | DEMOGRAPHICS | `urban_percentage` | NoneType | Urban population percentage | NOT_AVAILABLE |
| 60 | DEMOGRAPHICS | `urban_population` | NoneType | Urban population count | NOT_AVAILABLE |
| 61 | DEVELOPMENT | `development_coverage_status` | str | Overall development coverage status | STRUCTURED |
| 62 | DEVELOPMENT | `flagship_scheme_presence` | str | Presence of flagship government schemes | STRUCTURED |
| 63 | DEVELOPMENT | `jal_jeevan_mission_info` | dict | Jal Jeevan Mission projects information | STRUCTURED |
| 64 | DEVELOPMENT | `linked_projects_count` | int | Count of linked development projects | STRUCTURED |
| 65 | DEVELOPMENT | `pmay_projects_info` | dict | PM Awas Yojana projects information | STRUCTURED |
| 66 | DEVELOPMENT | `pmgsy_projects_info` | dict | PM Gram Sadak Yojana projects information | STRUCTURED |
| 67 | ECONOMY | `bank_branches_count` | str | Number of bank branches | NOT_AVAILABLE |
| 68 | ECONOMY | `financial_inclusion_status` | str | Financial inclusion status description | NOT_AVAILABLE |
| 69 | ECONOMY | `irrigation_coverage` | str | Irrigation coverage description | NOT_AVAILABLE |
| 70 | ECONOMY | `major_crops_summary` | str | Major crops grown in the constituency | NOT_AVAILABLE |
| 71 | ECONOMY | `major_industries_summary` | str | Major industries in the constituency | NOT_AVAILABLE |
| 72 | ECONOMY | `msme_units_count` | str | Number of MSME units | NOT_AVAILABLE |
| 73 | ECONOMY | `national_highways_count` | str | Number of national highways passing through | NOT_AVAILABLE |
| 74 | ECONOMY | `odop_cluster` | str | ODOP cluster name | NOT_AVAILABLE |
| 75 | ECONOMY | `odop_export_orientation` | str | ODOP export orientation classification | NOT_AVAILABLE |
| 76 | ECONOMY | `odop_product` | str | One District One Product identified product | NOT_AVAILABLE |
| 77 | ECONOMY | `railway_stations_count` | str | Number of railway stations | NOT_AVAILABLE |
| 78 | ELECTIONS | `current_mla_by_election_date` | str | Date of by-election if MLA elected via by-election | ACTIVE |
| 79 | ELECTIONS | `current_mla_elected_via` | str | How current MLA was elected (GENERAL/BY_ELECTION) | ACTIVE |
| 80 | ELECTIONS | `current_mla_name` | str | Current MLA name (as of research cutoff date) | ACTIVE |
| 81 | ELECTIONS | `current_mla_party` | str | Current MLA party affiliation | ACTIVE |
| 82 | ELECTIONS | `current_mla_previous_representative` | str | Name of previous representative if MLA changed mid-term | ACTIVE |
| 83 | ELECTIONS | `current_mla_representation_change_type` | str | Type of representation change (SAME_PARTY/PARTY_CHANGE) | ACTIVE |
| 84 | ELECTIONS | `current_mla_status` | str | MLA status (SERVING/VACANT/SUSPENDED) | ACTIVE |
| 85 | ELECTIONS | `current_mla_vacancy_reason` | str | Reason for vacancy if MLA changed mid-term | ACTIVE |
| 86 | ELECTIONS | `current_mp_name` | str | Current Lok Sabha MP name for the parent PC | ACTIVE |
| 87 | ELECTIONS | `current_mp_party` | str | Current Lok Sabha MP party affiliation | ACTIVE |
| 88 | ELECTIONS | `current_mp_pc_name` | str | PC name for current MP | ACTIVE |
| 89 | ELECTIONS | `current_mp_term_end` | str | MP term end date (projected) | ACTIVE |
| 90 | ELECTIONS | `current_mp_term_start` | str | MP term start date | ACTIVE |
| 91 | ELECTIONS | `ls2024_party_changed_flag` | bool | Whether the winning party changed vs previous election | ACTIVE |
| 92 | ELECTIONS | `ls2024_pc_winner` | str | 2024 Lok Sabha election winner name | ACTIVE |
| 93 | ELECTIONS | `ls2024_pc_winner_party` | str | 2024 Lok Sabha election winner party | ACTIVE |
| 94 | ELECTIONS | `ls2024_pc_winner_party_id` | str | Canonical party ID for 2024 LS winner | ACTIVE |
| 95 | ELECTIONS | `ls2024_winner_changed_flag` | bool | Whether the LS winner changed vs previous election | ACTIVE |
| 96 | ELECTIONS | `party_trajectory_compact` | str | Compact party trajectory notation across elections | ACTIVE |
| 97 | ELECTIONS | `runner_up_2012` | str | Runner-up name in 2012 UP Vidhan Sabha election | ACTIVE |
| 98 | ELECTIONS | `runner_up_2017` | str | Runner-up name in 2017 UP Vidhan Sabha election | ACTIVE |
| 99 | ELECTIONS | `runner_up_2022` | str | Runner-up name in 2022 UP Vidhan Sabha election | ACTIVE |
| 100 | ELECTIONS | `runner_up_party_2012` | str | Runner-up party in 2012 UP Vidhan Sabha election | ACTIVE |
| 101 | ELECTIONS | `runner_up_party_2017` | str | Runner-up party in 2017 UP Vidhan Sabha election | ACTIVE |
| 102 | ELECTIONS | `runner_up_party_2022` | str | Runner-up party in 2022 UP Vidhan Sabha election | ACTIVE |
| 103 | ELECTIONS | `seat_history_summary` | str | Compact summary of winner-party across all three elections | ACTIVE |
| 104 | ELECTIONS | `total_candidates_2012` | int | Total number of candidates contesting in 2012 election | ACTIVE |
| 105 | ELECTIONS | `total_candidates_2017` | int | Total candidates contesting in 2017 election | ACTIVE |
| 106 | ELECTIONS | `total_candidates_2022` | int | Total candidates contesting in 2022 election | ACTIVE |
| 107 | ELECTIONS | `total_valid_votes_2012` | int | Total valid votes cast in 2012 election | ACTIVE |
| 108 | ELECTIONS | `total_valid_votes_2017` | int | Total valid votes cast in 2017 election | ACTIVE |
| 109 | ELECTIONS | `total_valid_votes_2022` | int | Total valid votes cast in 2022 election | ACTIVE |
| 110 | ELECTIONS | `winner_2012` | str | Winner name in 2012 Uttar Pradesh Vidhan Sabha election | ACTIVE |
| 111 | ELECTIONS | `winner_2017` | str | Winner name in 2017 Uttar Pradesh Vidhan Sabha election | ACTIVE |
| 112 | ELECTIONS | `winner_2022` | str | Winner name in 2022 Uttar Pradesh Vidhan Sabha election | ACTIVE |
| 113 | ELECTIONS | `winner_party_2012` | str | Winner party in 2012 UP Vidhan Sabha election | ACTIVE |
| 114 | ELECTIONS | `winner_party_2017` | str | Winner party in 2017 UP Vidhan Sabha election | ACTIVE |
| 115 | ELECTIONS | `winner_party_2022` | str | Winner party in 2022 UP Vidhan Sabha election | ACTIVE |
| 116 | ELECTIONS | `winner_vote_share_2012` | float | Winner vote share percentage in 2012 election | ACTIVE |
| 117 | ELECTIONS | `winner_vote_share_2017` | float | Winner vote share percentage in 2017 election | ACTIVE |
| 118 | ELECTIONS | `winner_vote_share_2022` | float | Winner vote share percentage in 2022 election | ACTIVE |
| 119 | ELECTIONS | `winner_votes_2012` | int | Winner vote count in 2012 UP Vidhan Sabha election | ACTIVE |
| 120 | ELECTIONS | `winner_votes_2017` | int | Winner vote count in 2017 UP Vidhan Sabha election | ACTIVE |
| 121 | ELECTIONS | `winner_votes_2022` | int | Winner vote count in 2022 UP Vidhan Sabha election | ACTIVE |
| 122 | GEOGRAPHY | `area_sq_km` | NoneType | Geographic area in square kilometres | NOT_AVAILABLE |
| 123 | GEOGRAPHY | `development_blocks_count` | int | Number of development blocks in the district | PARTIAL |
| 124 | GEOGRAPHY | `forest_area` | str | Forest cover description | NOT_AVAILABLE |
| 125 | GEOGRAPHY | `major_rivers` | str | Major river systems flowing through the constituency | NOT_AVAILABLE |
| 126 | GEOGRAPHY | `municipal_bodies_count` | int | Number of municipal bodies in the district | PARTIAL |
| 127 | GEOGRAPHY | `sub_divisions_count` | int | Number of sub-divisions in the district | PARTIAL |
| 128 | GEOGRAPHY | `tehsils_count` | int | Number of tehsils in the district | PARTIAL |
| 129 | GEOGRAPHY | `terrain_type` | str | Terrain classification (plain/plateau/hilly/riverine) | NOT_AVAILABLE |
| 130 | GOVERNANCE | `disaster_risks_summary` | str | Summary of disaster risks | PARTIAL |
| 131 | GOVERNANCE | `environmental_issues_summary` | str | Summary of environmental issues | PARTIAL |
| 132 | GOVERNANCE | `governance_issue_count` | int | Count of identified governance issues | PARTIAL |
| 133 | GOVERNANCE | `governance_issue_summary` | str | Summary of governance issues | PARTIAL |
| 134 | IDENTIFICATION | `ac_number` | int | Assembly constituency number per ECI Delimitation Order 2008 | ACTIVE |
| 135 | IDENTIFICATION | `canonical_constituency_id` | str | Canonical knowledge-object identifier in The Breakdown platform | ACTIVE |
| 136 | IDENTIFICATION | `constituency_name` | str | Official assembly constituency name per ECI Delimitation Order 2008 | ACTIVE |
| 137 | IDENTIFICATION | `pc_name` | str | Official parliamentary constituency name per ECI Delimitation 2008 | ACTIVE |
| 138 | IDENTIFICATION | `pc_number` | int | Parliamentary constituency number per ECI Delimitation 2008 | ACTIVE |
| 139 | INFRASTRUCTURE | `chc_count` | str | Number of Community Health Centres | NOT_AVAILABLE |
| 140 | INFRASTRUCTURE | `degree_colleges_count` | str | Number of degree colleges | NOT_AVAILABLE |
| 141 | INFRASTRUCTURE | `district_hospitals_count` | str | Number of district hospitals | NOT_AVAILABLE |
| 142 | INFRASTRUCTURE | `government_schools_count` | str | Number of government schools | NOT_AVAILABLE |
| 143 | INFRASTRUCTURE | `household_electrification_info` | str | Household electrification status | NOT_AVAILABLE |
| 144 | INFRASTRUCTURE | `iti_count` | str | Number of Industrial Training Institutes | NOT_AVAILABLE |
| 145 | INFRASTRUCTURE | `phc_count` | str | Number of Primary Health Centres | NOT_AVAILABLE |
| 146 | METADATA | `computed_at` | str | Timestamp of data computation | ACTIVE |
| 147 | METADATA | `master_dataset_version` | str | Master dataset version identifier | ACTIVE |
| 148 | METADATA | `research_cutoff_date` | str | Research cutoff date for data currency | ACTIVE |
| 149 | METADATA | `source_datasets` | str | Source datasets used for this record | ACTIVE |
| 150 | METADATA | `verification_date` | str | Date of last verification | ACTIVE |

## Enrichment Gaps

- **demographics**: All 13 demographic fields are NOT_AVAILABLE — Census 2011 PCA requires GIS intersection
- **economy**: All 11 economic fields are NOT_AVAILABLE at AC level
- **infrastructure**: 7 of 8 infrastructure fields NOT_AVAILABLE
- **geography**: 4 of 8 geography fields NOT_AVAILABLE (area, terrain, rivers, forest)
