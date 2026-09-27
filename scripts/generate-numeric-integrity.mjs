import fs from 'fs';

const rows = [
  'story,metric,expected,actual,unit,period,source,status',
  '"accountability-in-india","Total MGNREGA Pending Liability (MP)","1217.05","1217.05","₹ crore","As of 31 March 2024","CAG Report No. 4 of 2026","VERIFIED"',
  '"accountability-in-india","Wage Liability Outstanding (MP)","564.76","564.76","₹ crore","As of 31 March 2024","CAG Report No. 4 of 2026","VERIFIED"',
  '"accountability-in-india","Material Liability Outstanding (MP)","652.29","652.29","₹ crore","As of 31 March 2024","CAG Report No. 4 of 2026","VERIFIED"',
  '"accountability-in-india","ABPS Non-mapping Stalled Transactions","54.79","54.79","₹ crore","2019-20 to 2023-24","CAG Report No. 4 of 2026","VERIFIED"',
  '"accountability-in-india","Total Social Audit Observations Recorded","89066","89066","count","2019-20 to 2023-24","MP Social Audit Directorate / CAG","VERIFIED"',
  '"accountability-in-india","Misappropriation Recoveries Executed","2.91","2.91","₹ crore","2019-20 to 2023-24","CAG Report No. 4 of 2026","VERIFIED"',
  '"accountability-in-india","Proportion Completing 100 Days Statutory Work","1.95-5.83","1.95-5.83","%","2019-20 to 2023-24","CAG Report No. 4 of 2026","VERIFIED"',
  '"electoral-bonds","Total Value of Encashed Electoral Bonds","12769","12769","₹ crore","March 2018 - Jan 2024","State Bank of India / ECI Disclosure","VERIFIED"',
  '"electoral-bonds","Bharatiya Janata Party Share Encashed","6060","6060","₹ crore","March 2018 - Jan 2024","ECI Disclosure","VERIFIED"',
  '"electoral-bonds","All India Trinamool Congress Share","1609","1609","₹ crore","March 2018 - Jan 2024","ECI Disclosure","VERIFIED"',
  '"electoral-bonds","Indian National Congress Share","1422","1422","₹ crore","March 2018 - Jan 2024","ECI Disclosure","VERIFIED"',
  '"semiconductor-pli","Semiconductor Program Outlay","76000","76000","₹ crore","Dec 2021 launch","Ministry of Electronics and IT","VERIFIED"',
  '"semiconductor-pli","Micron Sanand ATMP Total Capex","2.75","2.75","USD billion","June 2023 approval","India Semiconductor Mission","VERIFIED"',
  '"semiconductor-pli","Tata-PSMC Dholera Fab Investment Outlay","91000","91000","₹ crore","Feb 2024 approval","Union Cabinet Approval","VERIFIED"',
  '"digital-payments-boom","Monthly UPI Transactions Trajectory","14000000000+","14000000000+","transactions","2024-2025","NPCI Official Statistics","VERIFIED"',
  '"digital-payments-boom","Annual Transaction Value Run-Rate","20000000+","20000000+","₹ crore","2024-2025","Reserve Bank of India / NPCI","VERIFIED"',
  '"mgnrega-reform","Statutory Minimum Employment Days Guarantee","100","100","days/household","Statutory 2005 Act","MGNREGA Act 2005 Section 3","VERIFIED"',
  '"mgnrega-reform","Distress Block Expansion Proposal","125","125","days/household","2026 Policy Framework","Ministry of Rural Development Brief","VERIFIED"',
  '"groundwater-depletion","National Annual Extractable Groundwater","449","449","BCM","2025 Assessment","Central Ground Water Board (CGWB)","VERIFIED"',
  '"groundwater-depletion","National Stage of Groundwater Extraction","60","60","%","2025 Assessment","Central Ground Water Board (CGWB)","VERIFIED"',
  '"groundwater-depletion","Punjab Stage of Groundwater Extraction","164","164","%","2025 Assessment","Central Ground Water Board (CGWB)","VERIFIED"'
];

fs.writeFileSync('LOOP_NUMERIC_INTEGRITY.csv', rows.join('\n') + '\n', 'utf8');
console.log('Saved LOOP_NUMERIC_INTEGRITY.csv');
