#!/usr/bin/env python3
"""
build-atlas-html.py — Generate clean, self-contained HTML atlas from Master Dataset v1
"""

import json
import os
import sys

DATASET_PATH = r'C:\newsjack-content\thebreakdown-os\data\master-dataset-v1\up403-master-dataset-v1.json'
OUTPUT_PATH = r'C:\newsjack-content\thebreakdown-os\data\master-dataset-v1\up403-constituency-atlas.html'

with open(DATASET_PATH, encoding='utf-8') as f:
    records = json.load(f)

# Escape data for JS embedding — assign directly as a JS expression
data_json = json.dumps(records, ensure_ascii=False)

HTML = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UP 403 — Constituency Intelligence Atlas v1.0</title>
<style>
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #232734;
    --border: #2d3240;
    --text: #e4e6ef;
    --text2: #9398a8;
    --accent: #6c8cff;
    --accent2: #4a6cd4;
    --green: #34d399;
    --yellow: #fbbf24;
    --red: #f87171;
    --orange: #fb923c;
    --purple: #a78bfa;
    --teal: #2dd4bf;
    --radius: 8px;
    --shadow: 0 2px 12px rgba(0,0,0,.3);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
  
  /* Header */
  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; position: sticky; top: 0; z-index: 100; }
  .header-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .header h1 { font-size: 18px; font-weight: 700; color: #fff; white-space: nowrap; }
  .header h1 span { color: var(--accent); }
  .header .subtitle { font-size: 12px; color: var(--text2); white-space: nowrap; }
  
  .search-box { flex: 1; min-width: 200px; position: relative; }
  .search-box input { width: 100%; padding: 8px 12px 8px 36px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 14px; outline: none; }
  .search-box input:focus { border-color: var(--accent); }
  .search-box .icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text2); font-size: 16px; }
  
  .stats { display: flex; gap: 12px; font-size: 12px; color: var(--text2); white-space: nowrap; }
  .stats span { display: flex; align-items: center; gap: 4px; }
  .stats strong { color: var(--text); }

  /* Filters */
  .filters { background: var(--surface); padding: 8px 24px 12px; border-bottom: 1px solid var(--border); position: sticky; top: 60px; z-index: 99; }
  .filters-inner { max-width: 1400px; margin: 0 auto; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .filters select { padding: 6px 10px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; outline: none; cursor: pointer; min-width: 130px; }
  .filters select:focus { border-color: var(--accent); }
  .filters label { font-size: 12px; color: var(--text2); display: flex; align-items: center; gap: 4px; }
  .filter-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .filter-tag.active { background: var(--accent); color: #fff; }
  .filter-tag.clear { background: var(--surface2); color: var(--text2); cursor: pointer; border: 1px solid var(--border); }
  .filter-tag.clear:hover { border-color: var(--red); color: var(--red); }

  /* Main */
  .main { max-width: 1400px; margin: 0 auto; padding: 16px 24px; }

  /* View toggle */
  .view-toggle { display: flex; gap: 4px; margin-bottom: 12px; }
  .view-toggle button { padding: 6px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); color: var(--text2); font-size: 13px; cursor: pointer; }
  .view-toggle button.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  /* Table view */
  .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: var(--surface2); position: sticky; top: 0; }
  th { padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text2); font-size: 11px; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--border); white-space: nowrap; cursor: pointer; user-select: none; }
  th:hover { color: var(--accent); }
  th .sort { margin-left: 4px; font-size: 10px; }
  td { padding: 8px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:hover td { background: rgba(108,140,255,.04); }
  tr.hidden { display: none; }
  
  .ac-link { color: var(--accent); text-decoration: none; font-weight: 600; cursor: pointer; }
  .ac-link:hover { text-decoration: underline; }
  
  /* Party badges */
  .party { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; letter-spacing: .3px; }
  .party-BJP { background: #f97316; color: #fff; }
  .party-SP { background: #2563eb; color: #fff; }
  .party-BSP { background: #1e40af; color: #fff; }
  .party-INC { background: #16a34a; color: #fff; }
  .party-RLD { background: #9333ea; color: #fff; }
  .party-AD-S { background: #dc2626; color: #fff; }
  .party-NISHAD { background: #0891b2; color: #fff; }
  .party-JSDL { background: #ca8a04; color: #fff; }
  .party-SBSP { background: #c026d3; color: #fff; }
  .party-other { background: #6b7280; color: #fff; }
  
  /* DNA badges */
  .dna { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .dna-POST_2014_REALIGNMENT { background: #f97316; color: #fff; }
  .dna-CONTESTED { background: #a78bfa; color: #fff; }
  .dna-INCUMBENT_STRONGHOLD { background: #2563eb; color: #fff; }
  .dna-SWING { background: #34d399; color: #111; }
  .dna-SP_FORTRESS { background: #2563eb; color: #fff; }
  
  /* Competitiveness badges */
  .comp { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .comp-ULTRA_SAFE { background: #059669; color: #fff; }
  .comp-SAFE { background: #34d399; color: #111; }
  .comp-LEAN { background: #fbbf24; color: #111; }
  .comp-COMPETITIVE { background: #fb923c; color: #fff; }
  .comp-HIGHLY_COMPETITIVE { background: #f87171; color: #fff; }
  .comp-MARGINAL { background: #dc2626; color: #fff; }

  /* Card view */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; cursor: pointer; transition: border-color .15s; }
  .card:hover { border-color: var(--accent); }
  .card.hidden { display: none; }
  .card .ac-name { font-size: 15px; font-weight: 700; color: #fff; }
  .card .ac-number { font-size: 12px; color: var(--text2); }
  .card .row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 13px; }
  .card .row-label { color: var(--text2); }
  .card .row-value { font-weight: 600; }

  /* Detail panel overlay */
  .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 200; }
  .overlay.open { display: block; }
  .panel { position: fixed; top: 0; right: 0; width: 600px; max-width: 100vw; height: 100vh; background: var(--surface); border-left: 1px solid var(--border); z-index: 201; overflow-y: auto; transform: translateX(100%); transition: transform .25s ease; }
  .panel.open { transform: translateX(0); }
  .panel-header { position: sticky; top: 0; background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 10; }
  .panel-header h2 { font-size: 18px; color: #fff; }
  .panel-header .sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .panel-close { background: none; border: none; color: var(--text2); font-size: 24px; cursor: pointer; padding: 4px; line-height: 1; }
  .panel-close:hover { color: var(--red); }

  .panel-body { padding: 16px 20px 40px; }

  /* Detail tabs */
  .tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px; }
  .tab-btn { padding: 6px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text2); font-size: 12px; cursor: pointer; }
  .tab-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .tab-pane { display: none; }
  .tab-pane.active { display: block; }

  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .detail-grid .field { padding: 6px 0; border-bottom: 1px solid var(--border); }
  .detail-grid .field.full { grid-column: 1 / -1; }
  .detail-grid .field-label { font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 2px; }
  .detail-grid .field-value { font-size: 14px; color: var(--text); word-break: break-word; }
  .detail-grid .field-value.empty { color: var(--text2); font-style: italic; }

  /* Section headers */
  .section-title { font-size: 13px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: .5px; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--border); }

  /* Pagination */
  .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 16px; font-size: 13px; }
  .pagination button { padding: 6px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 13px; cursor: pointer; }
  .pagination button:hover { background: var(--surface2); }
  .pagination button:disabled { opacity: .3; cursor: default; }
  .pagination .info { color: var(--text2); }

  /* Responsive */
  @media (max-width: 768px) {
    .header h1 { font-size: 15px; }
    .header .subtitle { display: none; }
    .stats { font-size: 11px; }
    .filters select { min-width: 100px; font-size: 12px; }
    .cards { grid-template-columns: 1fr; }
    .panel { width: 100vw; }
    .detail-grid { grid-template-columns: 1fr; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Animation */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .card, tr { animation: fadeIn .2s ease; }
</style>
</head>
<body>

<div class="header">
<div class="header-inner">
  <h1>UP <span>403</span></h1>
  <div class="subtitle">Constituency Intelligence Atlas v1.0</div>
  <div class="search-box">
    <span class="icon">&#x1F50D;</span>
    <input type="text" id="search" placeholder="Search constituency, MLA, MP, district..." oninput="filterTable()">
  </div>
  <div class="stats">
    <span>Showing <strong id="showing">403</strong> of <strong>403</strong></span>
    <span>&middot;</span>
    <span><strong>150</strong> fields per AC</span>
    <span>&middot;</span>
    <span><strong>81.4%</strong> data density</span>
  </div>
</div>
</div>

<div class="filters">
<div class="filters-inner">
  <label>District <select id="filter-district" onchange="filterTable()"><option value="">All</option></select></label>
  <label>Party <select id="filter-party" onchange="filterTable()"><option value="">All</option></select></label>
  <label>DNA <select id="filter-dna" onchange="filterTable()"><option value="">All</option></select></label>
  <label>Competitiveness <select id="filter-comp" onchange="filterTable()"><option value="">All</option></select></label>
  <label>Reservation <select id="filter-res" onchange="filterTable()"><option value="">All</option></select></label>
  <span class="filter-tag clear" onclick="clearFilters()">&#x2716; Clear</span>
</div>
</div>

<div class="main">
<div class="view-toggle">
  <button class="active" onclick="setView('table')">&#x2630; Table</button>
  <button onclick="setView('cards')">&#x25A6; Cards</button>
</div>

<div id="table-view">
<div class="table-wrap">
<table>
<thead><tr>
  <th onclick="sortBy('ac_number')">AC# <span class="sort">&#x25B2;&#x25BC;</span></th>
  <th onclick="sortBy('constituency_name')">Name <span class="sort">&#x25B2;&#x25BC;</span></th>
  <th>District</th>
  <th>Party</th>
  <th>Winner 2022</th>
  <th>Margin %</th>
  <th>MLA</th>
  <th>MP</th>
  <th>DNA</th>
  <th>Competitiveness</th>
</tr></thead>
<tbody id="table-body"></tbody>
</table>
</div>
</div>

<div id="card-view" style="display:none">
<div class="cards" id="card-grid"></div>
</div>

<div class="pagination" id="pagination">
  <button id="prev-page" onclick="changePage(-1)">&#x25C0; Prev</button>
  <span class="info" id="page-info">Page 1 of 1</span>
  <button id="next-page" onclick="changePage(1)">Next &#x25B6;</button>
</div>
</div>

<div class="overlay" id="overlay" onclick="closeDetail()"></div>
<div class="panel" id="panel">
<div class="panel-header">
  <div>
    <h2 id="detail-title"></h2>
    <div class="sub" id="detail-sub"></div>
  </div>
  <button class="panel-close" onclick="closeDetail()">&times;</button>
</div>
<div class="panel-body" id="detail-body"></div>
</div>

<script>
var DATA = DATA_PLACEHOLDER;

var filtered = DATA;
var currentView = 'table';
var currentPage = 1;
var pageSize = 50;
var sortField = 'ac_number';
var sortDir = 1;

function init() {
  var districts = [...new Set(DATA.map(function(r){return r.district;}))].sort();
  var parties = [...new Set(DATA.map(function(r){return r.winner_party_2022;}))].sort();
  var dnas = [...new Set(DATA.map(function(r){return r.dna_classification;}))].sort();
  var comps = [...new Set(DATA.map(function(r){return r.competitiveness_class;}))].sort();
  var ress = [...new Set(DATA.map(function(r){return r.reservation_type;}))].sort();
  
  fillSelect('filter-district', districts);
  fillSelect('filter-party', parties);
  fillSelect('filter-dna', dnas);
  fillSelect('filter-comp', comps);
  fillSelect('filter-res', ress);
  
  filterTable();
}

function fillSelect(id, values) {
  var sel = document.getElementById(id);
  values.forEach(function(v) {
    var o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

function partyClass(p) {
  if (!p) return 'party-other';
  p = p.replace(/[()]/g,'-');
  var cls = 'party-' + p;
  if (document.querySelector('.' + cls)) return cls;
  return 'party-other';
}

function dnaLabel(d) {
  if (!d) return 'UNKNOWN';
  return d.replace(/_/g, ' ');
}

function compLabel(c) {
  if (!c) return 'UNKNOWN';
  return c.replace(/_/g, ' ');
}

function escape(s) {
  if (s == null || s === 'None') return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function filterTable() {
  var search = document.getElementById('search').value.toLowerCase().trim();
  var district = document.getElementById('filter-district').value;
  var party = document.getElementById('filter-party').value;
  var dna = document.getElementById('filter-dna').value;
  var comp = document.getElementById('filter-comp').value;
  var res = document.getElementById('filter-res').value;
  
  filtered = DATA.filter(function(r) {
    if (district && r.district !== district) return false;
    if (party && r.winner_party_2022 !== party) return false;
    if (dna && r.dna_classification !== dna) return false;
    if (comp && r.competitiveness_class !== comp) return false;
    if (res && r.reservation_type !== res) return false;
    if (search) {
      var haystack = (r.constituency_name + ' ' + r.district + ' ' + (r.current_mla_name||'') + ' ' + (r.current_mp_name||'') + ' ' + (r.winner_2022||'') + ' ' + (r.pc_name||'') + ' ' + r.canonical_constituency_id).toLowerCase();
      return haystack.indexOf(search) !== -1;
    }
    return true;
  });
  
  currentPage = 1;
  document.getElementById('showing').textContent = filtered.length;
  sortData();
  render();
}

function sortBy(field) {
  if (sortField === field) { sortDir = -sortDir; }
  else { sortField = field; sortDir = 1; }
  sortData();
  render();
}

function sortData() {
  filtered.sort(function(a, b) {
    var va = a[sortField], vb = b[sortField];
    if (va == null || va === '') va = '';
    if (vb == null || vb === '') vb = '';
    if (typeof va === 'number' && typeof vb === 'number') return sortDir * (va - vb);
    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    if (va < vb) return -sortDir;
    if (va > vb) return sortDir;
    return 0;
  });
}

function render() {
  if (currentView === 'table') renderTable();
  else renderCards();
  renderPagination();
}

function renderTable() {
  var tbody = document.getElementById('table-body');
  var start = (currentPage - 1) * pageSize;
  var end = Math.min(start + pageSize, filtered.length);
  var html = '';
  for (var i = start; i < end; i++) {
    var r = filtered[i];
    html += '<tr><td><a class="ac-link" onclick="openDetail(' + r.ac_number + ')">' + r.ac_number + '</a></td>'
         + '<td><a class="ac-link" onclick="openDetail(' + r.ac_number + ')">' + escape(r.constituency_name) + '</a></td>'
         + '<td>' + escape(r.district) + '</td>'
         + '<td><span class="party ' + partyClass(r.winner_party_2022) + '">' + escape(r.winner_party_2022) + '</span></td>'
         + '<td>' + escape(r.winner_2022) + '</td>'
         + '<td>' + (r.victory_margin_pct_2022 != null && r.victory_margin_pct_2022 !== '' ? r.victory_margin_pct_2022.toFixed(1) + '%' : '') + '</td>'
         + '<td>' + escape(r.current_mla_name) + ' <span class="party ' + partyClass(r.current_mla_party) + '" style="font-size:10px">' + escape(r.current_mla_party) + '</span></td>'
         + '<td>' + escape(r.current_mp_name) + ' <span class="party ' + partyClass(r.current_mp_party) + '" style="font-size:10px">' + escape(r.current_mp_party) + '</span></td>'
         + '<td><span class="dna dna-' + r.dna_classification + '">' + dnaLabel(r.dna_classification) + '</span></td>'
         + '<td><span class="comp comp-' + r.competitiveness_class + '">' + compLabel(r.competitiveness_class) + '</span></td></tr>';
  }
  tbody.innerHTML = html;
}

function renderCards() {
  var grid = document.getElementById('card-grid');
  var start = (currentPage - 1) * pageSize;
  var end = Math.min(start + pageSize, filtered.length);
  var html = '';
  for (var i = start; i < end; i++) {
    var r = filtered[i];
    html += '<div class="card" onclick="openDetail(' + r.ac_number + ')">'
         + '<div style="display:flex;justify-content:space-between;align-items:baseline">'
         + '<div class="ac-name">' + escape(r.constituency_name) + '</div>'
         + '<div class="ac-number">AC #' + r.ac_number + '</div></div>'
         + '<div style="font-size:12px;color:var(--text2);margin-top:2px">' + escape(r.district) + ' &middot; ' + r.pc_name + '</div>'
         + '<div class="row"><span class="row-label">2022 Winner</span><span class="row-value"><span class="party ' + partyClass(r.winner_party_2022) + '">' + escape(r.winner_party_2022) + '</span> ' + escape(r.winner_2022) + '</span></div>'
         + '<div class="row"><span class="row-label">Margin</span><span class="row-value">' + (r.victory_margin_pct_2022 != null && r.victory_margin_pct_2022 !== '' ? r.victory_margin_pct_2022.toFixed(1) + '%' : 'N/A') + '</span></div>'
         + '<div class="row"><span class="row-label">Current MLA</span><span class="row-value">' + escape(r.current_mla_name) + ' <span class="party ' + partyClass(r.current_mla_party) + '" style="font-size:10px">' + escape(r.current_mla_party) + '</span></span></div>'
         + '<div class="row"><span class="row-label">Current MP</span><span class="row-value">' + escape(r.current_mp_name) + ' <span class="party ' + partyClass(r.current_mp_party) + '" style="font-size:10px">' + escape(r.current_mp_party) + '</span></span></div>'
         + '<div class="row"><span class="row-label">DNA</span><span class="row-value"><span class="dna dna-' + r.dna_classification + '">' + dnaLabel(r.dna_classification) + '</span></span></div>'
         + '<div class="row"><span class="row-label">Competitiveness</span><span class="row-value"><span class="comp comp-' + r.competitiveness_class + '">' + compLabel(r.competitiveness_class) + '</span></span></div>'
         + '</div>';
  }
  grid.innerHTML = html;
}

function renderPagination() {
  var totalPages = Math.ceil(filtered.length / pageSize) || 1;
  document.getElementById('page-info').textContent = 'Page ' + currentPage + ' of ' + totalPages;
  document.getElementById('prev-page').disabled = (currentPage <= 1);
  document.getElementById('next-page').disabled = (currentPage >= totalPages);
}

function changePage(delta) {
  var totalPages = Math.ceil(filtered.length / pageSize) || 1;
  var newPage = currentPage + delta;
  if (newPage < 1 || newPage > totalPages) return;
  currentPage = newPage;
  render();
  document.getElementById('pagination').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-toggle button').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.view-toggle button')[view === 'table' ? 0 : 1].classList.add('active');
  document.getElementById('table-view').style.display = (view === 'table' ? '' : 'none');
  document.getElementById('card-view').style.display = (view === 'cards' ? '' : 'none');
  currentPage = 1;
  render();
}

function clearFilters() {
  document.getElementById('filter-district').value = '';
  document.getElementById('filter-party').value = '';
  document.getElementById('filter-dna').value = '';
  document.getElementById('filter-comp').value = '';
  document.getElementById('filter-res').value = '';
  document.getElementById('search').value = '';
  filterTable();
}

function buildDetailHTML(r) {
  var h = '';
  
  // Identity & Location
  h += '<div class="section-title">Identity &amp; Location</div><div class="detail-grid">';
  h += field('AC Number', r.ac_number);
  h += field('Constituency ID', r.canonical_constituency_id);
  h += field('Constituency Name', r.constituency_name);
  h += field('PC Number', r.pc_number);
  h += field('PC Name', r.pc_name);
  h += field('District', r.district);
  h += field('Division', r.division);
  h += field('Region', r.region);
  h += field('Reservation', r.reservation_type);
  h += '</div>';

  // Current Representation
  h += '<div class="section-title">Current Representation</div><div class="detail-grid">';
  h += field('MLA Name', r.current_mla_name, 'full');
  h += field('MLA Party', r.current_mla_party);
  h += field('MLA Status', r.current_mla_status);
  h += field('Elected Via', r.current_mla_elected_via);
  h += field('Previous Rep', r.current_mla_previous_representative);
  h += field('Change Type', r.current_mla_representation_change_type);
  h += field('MP Name', r.current_mp_name, 'full');
  h += field('MP Party', r.current_mp_party);
  h += field('MP Term Start', r.current_mp_term_start);
  h += field('MP Term End', r.current_mp_term_end);
  h += '</div>';

  // 2022 Election
  h += '<div class="section-title">2022 Assembly Election</div><div class="detail-grid">';
  h += field('Winner', r.winner_2022, 'full');
  h += field('Party', r.winner_party_2022);
  h += field('Votes', r.winner_votes_2022 != null ? r.winner_votes_2022.toLocaleString() : '');
  h += field('Vote Share', r.winner_vote_share_2022 != null ? r.winner_vote_share_2022 + '%' : '');
  h += field('Runner Up', r.runner_up_2022, 'full');
  h += field('Runner Up Party', r.runner_up_party_2022);
  h += field('Margin %', r.victory_margin_pct_2022 != null ? r.victory_margin_pct_2022.toFixed(2) + '%' : '');
  h += field('Total Valid Votes', r.total_valid_votes_2022 != null ? r.total_valid_votes_2022.toLocaleString() : '');
  h += field('Total Candidates', r.total_candidates_2022);
  h += '</div>';

  // 2017 & 2012 historical
  h += '<div class="section-title">2017 Assembly Election</div><div class="detail-grid">';
  h += field('Winner', r.winner_2017, 'full');
  h += field('Party', r.winner_party_2017);
  h += field('Margin %', r.victory_margin_pct_2017 != null ? r.victory_margin_pct_2017.toFixed(2) + '%' : '');
  h += field('Runner Up', r.runner_up_2017, 'full');
  h += '</div>';

  h += '<div class="section-title">2012 Assembly Election</div><div class="detail-grid">';
  h += field('Winner', r.winner_2012, 'full');
  h += field('Party', r.winner_party_2012);
  h += field('Margin %', r.victory_margin_pct_2012 != null ? r.victory_margin_pct_2012.toFixed(2) + '%' : '');
  h += field('Runner Up', r.runner_up_2012, 'full');
  h += '</div>';

  // 2024 LS Overlay
  if (r.ls2024_pc_winner) {
    h += '<div class="section-title">2024 Lok Sabha Overlay</div><div class="detail-grid">';
    h += field('PC Winner', r.ls2024_pc_winner, 'full');
    h += field('PC Winner Party', r.ls2024_pc_winner_party);
    h += field('Winner Changed', r.ls2024_winner_changed_flag !== '' ? r.ls2024_winner_changed_flag : '');
    h += field('Party Changed', r.ls2024_party_changed_flag !== '' ? r.ls2024_party_changed_flag : '');
    h += '</div>';
  }

  // Political DNA
  h += '<div class="section-title">Political DNA</div><div class="detail-grid">';
  h += field('Classification', r.dna_classification);
  h += field('Sub Type', r.dna_sub_type);
  h += field('Confidence', r.dna_confidence);
  h += field('Reasoning', r.dna_reasoning, 'full');
  h += field('Algorithm', r.dna_algorithm_version);
  h += '</div>';

  // Competitiveness
  h += '<div class="section-title">Competitiveness</div><div class="detail-grid">';
  h += field('Class', r.competitiveness_class);
  h += field('Trend', r.competitiveness_trend);
  h += field('Avg Margin %', r.competitiveness_avg_margin_pct != null ? r.competitiveness_avg_margin_pct.toFixed(2) + '%' : '');
  h += '</div>';

  // Electoral Stability & Trajectory
  h += '<div class="section-title">Electoral Stability &amp; Trajectory</div><div class="detail-grid">';
  h += field('Seat Volatility Index', r.seat_volatility_index);
  h += field('Party Continuity Score', r.party_continuity_score);
  h += field('Winner Continuity Score', r.winner_continuity_score);
  h += field('Most Persistent Party', r.most_persistent_party);
  h += field('Party Turnover Count', r.party_turnover_count);
  h += field('Unique Winners', r.unique_winners_across_elections);
  h += field('Trajectory Shifts', r.trajectory_total_shifts);
  h += field('Unique Parties', r.trajectory_unique_parties);
  h += field('Trajectory', r.trajectory_steps_compact, 'full');
  h += field('Seat History', r.seat_history_summary, 'full');
  h += '</div>';

  // Derived Metrics
  h += '<div class="section-title">Derived Metrics</div><div class="detail-grid">';
  h += field('Electoral Competitiveness', r.derived_electoral_competitiveness_score);
  h += field('Winner Persistence', r.derived_winner_persistence_score);
  h += field('Party Persistence', r.derived_party_persistence_score);
  h += field('Representation Continuity', r.derived_representation_continuity_score);
  h += field('BJP Competitiveness', r.derived_bjp_competitiveness_score);
  h += field('SP Competitiveness', r.derived_sp_competitiveness_score);
  h += field('Governance Issue Density', r.derived_governance_issue_density);
  h += field('Development Coverage', r.derived_development_coverage_index);
  h += '</div>';

  // Demographics
  h += '<div class="section-title">Demographics</div><div class="detail-grid">';
  h += field('Population', r.population_value != null ? r.population_value.toLocaleString() : r.demographics_availability_status);
  h += field('SC Population', r.sc_population != null ? r.sc_population.toLocaleString() : '');
  h += field('SC %', r.sc_percentage != null ? r.sc_percentage + '%' : '');
  h += field('ST Population', r.st_population != null ? r.st_population.toLocaleString() : '');
  h += field('ST %', r.st_percentage != null ? r.st_percentage + '%' : '');
  h += field('Literacy Rate', r.overall_literacy_rate != null ? r.overall_literacy_rate + '%' : '');
  h += field('Male Literacy', r.male_literacy_rate != null ? r.male_literacy_rate + '%' : '');
  h += field('Female Literacy', r.female_literacy_rate != null ? r.female_literacy_rate + '%' : '');
  h += field('Urban %', r.urban_percentage != null ? r.urban_percentage + '%' : '');
  h += field('Rural %', r.rural_percentage != null ? r.rural_percentage + '%' : '');
  h += field('Status', r.demographics_availability_status, 'full');
  h += '</div>';

  // Economy
  h += '<div class="section-title">Economy</div><div class="detail-grid">';
  h += field('Major Crops', r.major_crops_summary, 'full');
  h += field('Major Industries', r.major_industries_summary, 'full');
  h += field('ODOP Product', r.odop_product);
  h += field('ODOP Cluster', r.odop_cluster);
  h += field('Irrigation Coverage', r.irrigation_coverage);
  h += field('Bank Branches', r.bank_branches_count);
  h += field('National Highways', r.national_highways_count);
  h += field('Railway Stations', r.railway_stations_count);
  h += field('Status', r.economy_availability_status, 'full');
  h += '</div>';

  // Infrastructure & Development
  h += '<div class="section-title">Infrastructure &amp; Development</div><div class="detail-grid">';
  h += field('Govt Schools', r.government_schools_count);
  h += field('Degree Colleges', r.degree_colleges_count);
  h += field('ITIs', r.iti_count);
  h += field('District Hospitals', r.district_hospitals_count);
  h += field('PHCs', r.phc_count);
  h += field('CHCs', r.chc_count);
  h += field('Electrification', r.household_electrification_info);
  h += field('PMGSY', r.pmgsy_projects_info);
  h += field('Jal Jeevan Mission', r.jal_jeevan_mission_info);
  h += field('PMAY', r.pmay_projects_info);
  h += field('Flagship Schemes', r.flagship_scheme_presence);
  h += field('Linked Projects', r.linked_projects_count);
  h += '</div>';

  // Governance & Issues
  h += '<div class="section-title">Governance &amp; Issues</div><div class="detail-grid">';
  h += field('Issue Count', r.governance_issue_count);
  if (r.governance_issue_summary) h += field('Issues', r.governance_issue_summary, 'full');
  if (r.environmental_issues_summary) h += field('Environmental', r.environmental_issues_summary, 'full');
  if (r.disaster_risks_summary) h += field('Disaster Risks', r.disaster_risks_summary, 'full');
  h += field('Governance Status', r.governance_availability_status, 'full');
  h += '</div>';

  // Provenance
  h += '<div class="section-title">Provenance</div><div class="detail-grid">';
  h += field('Source Datasets', r.source_datasets, 'full');
  h += field('Verification Date', r.verification_date);
  h += field('Research Cutoff', r.research_cutoff_date);
  h += field('Computed At', r.computed_at);
  h += field('Dataset Version', r.master_dataset_version);
  h += '</div>';

  return h;
}

function field(label, value, cls) {
  if (value == null || value === '' || value === 'None') return '';
  cls = cls || '';
  return '<div class="field ' + cls + '"><div class="field-label">' + label + '</div><div class="field-value">' + escape(value) + '</div></div>';
}

function openDetail(acNumber) {
  var r = DATA.filter(function(d) { return d.ac_number === acNumber; })[0];
  if (!r) return;
  document.getElementById('detail-title').textContent = r.constituency_name;
  document.getElementById('detail-sub').textContent = 'AC #' + r.ac_number + ' \u00B7 ' + r.district + ' \u00B7 ' + r.pc_name + ' \u00B7 ' + r.region;
  document.getElementById('detail-body').innerHTML = buildDetailHTML(r);
  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('panel').classList.remove('open');
  document.body.style.overflow = '';
}

// Keyboard nav
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeDetail();
});

// Click outside panel
document.getElementById('overlay').addEventListener('click', closeDetail);

init();
</script>
</body>
</html>'''

# Embed data
HTML = HTML.replace('DATA_PLACEHOLDER', data_json)

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(HTML)

size_kb = os.path.getsize(OUTPUT_PATH) / 1024
print('Atlas generated: %s' % OUTPUT_PATH)
print('Size: %.0f KB' % size_kb)
print('Records embedded: %d' % len(records))
