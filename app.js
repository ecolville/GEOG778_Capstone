
  require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Locate",
    "esri/widgets/Search",
    "esri/widgets/Expand",
    "esri/layers/FeatureLayer",
    "esri/widgets/LayerList"
  ], function(esriConfig, Map, MapView, BasemapGallery, Locate, Search, Expand, FeatureLayer, LayerList) {

    if (!window.ARCGIS_API_KEY) console.error("ArcGIS API key is missing. Did you create config.local.js with your key?");
    esriConfig.apiKey = window.ARCGIS_API_KEY;

    // Map & View
    const map = new Map({ basemap: "gray-vector" });
    const view = new MapView({
      container: "viewDiv",
      map,
      center: [-89.8505, 44.8505],
      zoom: 8,
      highlightOptions: { color: [240,170,0,0.9], haloOpacity: 0.25, fillOpacity: 0.15 }
    });

    // Widgets
    const bgGallery = new BasemapGallery({ view });
    view.ui.add(new Expand({ view, content: bgGallery, expandIconClass: "esri-icon-basemap" }), "top-left");
    view.ui.add(new Locate({ view }), "top-left");
    const searchWidget = new Search({ view, suggestionsEnabled: true, maxSuggestions: 3 });
    view.ui.add(new Expand({ view, content: searchWidget, expandIconClass: "esri-icon-search", expandTooltip: "Search" }), { position: "top-left", index: 2 });

    const showTeacherPanelBtn = document.getElementById("showTeacherPanelBtn");


    // Layers
    const bedrockGeology = new FeatureLayer({
      url: "https://services1.arcgis.com/kkX9mRo34fTGAX96/arcgis/rest/services/Bedrock_All_symbolized/FeatureServer",
      title: "Bedrock Geology",
      outFields: ["UnitName", "Age", "RockType", "Descr"],
      opacity: 0.65, blendMode: "multiply",
      visible: false,
      popupTemplate: {
        title: "{UnitName}",
        content: `<b>Age:</b> {Age}<br><b>Rock Type:</b> {RockType}<br><b>Description:</b> {Descr}`
      }
    });
    map.add(bedrockGeology);

    const glacialGeology = new FeatureLayer({
      url: "https://services1.arcgis.com/kkX9mRo34fTGAX96/arcgis/rest/services/Surficial_Geology_View/FeatureServer/0",
      title: "Glacial Geology",
      outFields: ["*"], opacity: 0.85, blendMode: "multiply",
      renderer: {
        type: "unique-value", field: "MapUnit",
        defaultSymbol: { type: "simple-fill", color: [200,200,200,0.15], outline: { color: [120,120,120,0.45], width: 0.3 } },
        uniqueValueInfos: [
          { value: "Ch", symbol: f("#98A48E") }, { value: "Ci", symbol: f("#C0DA94") },
          { value: "Cl", symbol: f("#98A48E") }, { value: "Cr", symbol: f("#B6D3AC") },
          { value: "Cs", symbol: f("#99C18A") }, { value: "Hh", symbol: f("#6C93BA") },
          { value: "Hm", symbol: f("#476686") }, { value: "Hs", symbol: f("#95B9DC") },
          { value: "Mr", symbol: f("#D2C8D6") }, { value: "b",  symbol: f("#B8C1BC") },
          { value: "lp", symbol: f("#E6E6E6") }, { value: "o",  symbol: f("#AA9388") },
          { value: "ru", symbol: f("#C6B4B7") }, { value: "sc", symbol: f("#F3EDC8") },
          { value: "sm", symbol: f("#F3EDC8") }, { value: "sn", symbol: f("#FFFFAB") },
          { value: "st", symbol: f("#F9EA98") }, { value: "su", symbol: f("#F3EDC8") }
        ]
      },
      popupTemplate: { title: "{Simplified}", content: "<b>Age:</b> {Age}<br><b>Description:</b> {Simplifi_1}" }
    });
    map.add(glacialGeology);

    function f(hex){
      const rgb = hexToRgb(hex);
      return { type: "simple-fill", color: [rgb.r, rgb.g, rgb.b, 0.9], outline: { color: [60,60,60,0.55], width: 0.4 } };
    }
    function hexToRgb(hex){ const h = hex.replace("#",""); return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }; }

   

    const trailURL = "https://services.arcgis.com/EeCmkqXss9GYEKIZ/arcgis/rest/services/IAT_Segments_CR/FeatureServer/0";
    const sectionsHalo = new FeatureLayer({
      url: trailURL, title: "IAT (halo)", listMode: "hide",
      outFields: ["Segment","length_mi","Status"],
      renderer: {
        type: "unique-value", field: "Status",
        defaultSymbol: { type: "simple-line", color: [0,0,0,0.22], width: 6.0 },
        uniqueValueInfos: [
          { value: "Ice Age Trail", symbol: { type:"simple-line", color:[0,0,0,0.25], width: 6.2 } },
          { value: "Connecting Route", symbol: { type:"simple-line", color:[0,0,0,0.20], width: 5.8, style:"dash" } }
        ]
      }
    });
    const sectionsTop = new FeatureLayer({
      url: trailURL, title: "IAT Sections & Connecting Routes",
      outFields: ["Segment","length_mi","Status"],
      renderer: {
        type: "unique-value", field: "Status",
        defaultSymbol: { type: "simple-line", color: [240,170,0,1], width: 2.8 },
        uniqueValueInfos: [
          { value: "Ice Age Trail", symbol: { type:"simple-line", color:[240,170,0,1], width: 2.8 } },
          { value: "Connecting Route", symbol: { type:"simple-line", color:[68,68,68,1], width: 2.6, style:"dash" } }
        ]
      },
      popupTemplate: { title: "{Segment}", content: `<div style="margin-bottom:8px;"><b>Type:</b> {Status}</div><div><b>Length (mi):</b> {length_mi}</div>` }
    });
    map.addMany([sectionsHalo, sectionsTop]);

     const poiLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/kkX9mRo34fTGAX96/arcgis/rest/services/POIs/FeatureServer/0",
      title: "Geologic Points of Interest",
      outFields: ["*"],
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-marker", style: "circle", size: 11,
          color: getComputedStyle(document.documentElement).getPropertyValue('--poi-main').trim(),
          outline: { color: getComputedStyle(document.documentElement).getPropertyValue('--poi-outline').trim(), width: 1.2 }
        }
      },
      popupTemplate: {
        title: "{Name}",
        content: (e) => {
          const a = e.graphic.attributes || {};
          const has = v => v && String(v).trim() !== "";
          return `
            <div style="line-height:1.45">
              ${has(a.Feature_Type) ? `<div><b>Type:</b> ${a.Feature_Type}</div>` : ""}
              ${has(a.Description)  ? `<div style="margin-top:8px;">${a.Description}</div>` : ""}
            </div>`;
        }
      }
    });
    map.add(poiLayer);

    const parking = new FeatureLayer({
      url: "https://services.arcgis.com/EeCmkqXss9GYEKIZ/arcgis/rest/services/IAT_Parking/FeatureServer",
      title: "Parking Areas",
      outFields: ["Parking_Type","Description","Fee","Overnight_Park","Parking_Notes"],
      visible: false,
      popupTemplate: {
        title: "Parking Area",
        content: `<div style="margin-bottom:6px;"><b>Type:</b> {Parking_Type}</div>
                  <div style="margin-bottom:6px;"><b>Description:</b> {Description}</div>
                  <div style="margin-bottom:6px;"><b>Fee:</b> {Fee}</div>
                  <div style="margin-bottom:6px;"><b>Overnight:</b> {Overnight_Park}</div>
                  <div><b>Notes:</b> {Parking_Notes}</div>`
      }
    });
    map.add(parking);

    // ----- Educator Sidebar: toggle + view.padding sync -----
    const appRoot   = document.getElementById("appRoot");
    const eduSide   = document.getElementById("eduSide");
    const eduToggle = document.getElementById("eduToggle");
    const headerEduBtn = document.getElementById("eduBtn");

    // Activities tab base content (used when no segment is selected)
    const activitiesListEl = document.getElementById("activitiesList");
    const defaultActivitiesHtml = activitiesListEl ? activitiesListEl.innerHTML : "";

    // ----- Teacher Panel Tabs (Segments | Concepts | Activities) -----
    const tabButtons = document.querySelectorAll(".eduTabBtn");
    const tabPanels  = document.querySelectorAll(".eduTabPanel");

    function setActiveTab(name){
      tabButtons.forEach(btn => {
        const isActive = btn.dataset.edutab === name;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });
      tabPanels.forEach(panel => {
        const isMatch = panel.id === `eduTab-${name}`;
        panel.hidden = !isMatch;
      });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.edutab;
        setActiveTab(name);
      });
    });

// ----- Segment content loaded from external JSON -----
let segmentContent = {};

fetch("segments.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load segments.json");
    }
    return response.json();
  })
  .then((data) => {
    segmentContent = data;
    console.log("Segment content loaded:", Object.keys(segmentContent));
  })
  .catch((err) => {
    console.error("Error loading segment content:", err);
  });

    const segIntroEl      = document.getElementById("segIntro");
    const segDetailsEl    = document.getElementById("segDetails");
    const segTitleTextEl  = document.getElementById("segTitleText");
    const segOverviewEl   = document.getElementById("segOverview");
    const segBedrockEl    = document.getElementById("segBedrock");
    const segGlacialEl    = document.getElementById("segGlacial");
    const segPOIsEl       = document.getElementById("segPOIs");
    const segConceptsEl   = document.getElementById("segConceptsLinks");

    function wrapParagraph(text) {
  if (!text) return "";
  return `<p>${text}</p>`;
}

function wrapList(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return "";
  const lis = items.map((item) => `<li>${item}</li>`).join("");
  return `<ul>${lis}</ul>`;
}


       function updateSegmentPanel(segmentName){
  const data = segmentContent[segmentName];

  // Always bring user to the Segments tab first
  setActiveTab("segments");

  if (!data){
    segIntroEl.textContent = `No custom educator content is available yet for "${segmentName}".`;
    segDetailsEl.hidden = true;

    // Reset activities tab to its default if we don't have segment-specific content
    if (activitiesListEl){
      activitiesListEl.innerHTML = defaultActivitiesHtml;
    }
    return;
  }

  // Populate Segments tab
  segIntroEl.textContent = "";
  segDetailsEl.hidden = false;
  segTitleTextEl.textContent = segmentName;

  segOverviewEl.innerHTML = wrapParagraph(data.overview);
  segBedrockEl.innerHTML  = wrapParagraph(data.bedrock);
  segGlacialEl.innerHTML  = wrapParagraph(data.glacial);
  segPOIsEl.innerHTML     = wrapList(data.pois);
  segConceptsEl.innerHTML = wrapList(data.concepts);

  // Also populate Activities tab with segment-specific recommendations at the top
  if (activitiesListEl){
    activitiesListEl.innerHTML = `
      <p><strong>Recommended activities for ${segmentName}:</strong></p>
      ${wrapList(data.activities)}
      <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.12);" />
      ${defaultActivitiesHtml}
    `;
  }
}


    function syncPadding(){
      const collapsed = appRoot.classList.contains("collapsed");
      const sideWidth = collapsed ? 0 : eduSide.getBoundingClientRect().width;
      view.padding = { top: 0, left: 0, bottom: 0, right: sideWidth };
    }
    syncPadding();

  eduToggle.addEventListener("click", () => {
  const collapsed = appRoot.classList.toggle("collapsed");
  eduToggle.textContent = collapsed ? "Show Teacher Panel" : "Hide";
  eduToggle.setAttribute("aria-expanded", String(!collapsed));
  syncPadding();
});

showTeacherPanelBtn.addEventListener("click", () => {
  // Uncollapse the sidebar
  appRoot.classList.remove("collapsed");

  // Update the Hide/Show button state
  eduToggle.setAttribute("aria-expanded", "true");
  eduToggle.textContent = "Hide";

  // Recalculate map padding so the view resizes correctly
  syncPadding();

  // Optional: scroll sidebar to top
  eduSide.querySelector('.eduSide__body')?.scrollTo({ top: 0, behavior: 'smooth' });
});
  

    const ro = new ResizeObserver(syncPadding);
    ro.observe(eduSide);
    window.addEventListener("resize", syncPadding);

    // ----- Welcome Modal (always show; close actions) -----
    const introModal    = document.getElementById("introModal");
    const introCloseBtn = introModal.querySelector(".close");
    const introExplore  = document.getElementById("introExplore");
    const introTeachers = document.getElementById("introTeachers");

    // show on load
    introModal.hidden = false;
    setTimeout(() => introExplore?.focus(), 50);

    function closeIntro(){ introModal.hidden = true; }
    introCloseBtn.addEventListener("click", closeIntro);
    introExplore.addEventListener("click", closeIntro);
    introTeachers.addEventListener("click", () => { closeIntro(); appRoot.classList.remove("collapsed"); eduToggle.setAttribute("aria-expanded","true"); eduToggle.textContent="Hide"; syncPadding(); });
    introModal.addEventListener("click", (e) => { if (e.target === introModal) closeIntro(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !introModal.hidden) closeIntro(); });

    // ----- Educator Resources Modal (opened from header button) -----
const eduResourcesModal = document.getElementById("eduResourcesModal");
const eduResCloseBtn = eduResourcesModal.querySelector(".close");

// open when header button is clicked
headerEduBtn.addEventListener("click", () => {
  eduResourcesModal.hidden = false;
  // focus first heading or close button for accessibility
  setTimeout(() => {
    eduResCloseBtn.focus();
  }, 50);
});

// close handlers
function closeEduResources() {
  eduResourcesModal.hidden = true;
}

eduResCloseBtn.addEventListener("click", closeEduResources);

// click outside content closes modal
eduResourcesModal.addEventListener("click", (e) => {
  if (e.target === eduResourcesModal) closeEduResources();
});

// Esc key closes if open
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !eduResourcesModal.hidden) {
    closeEduResources();
  }
});


    // ----- Layer List -----
    const layerList = new LayerList({ view });
const layerListExpand = new Expand({
  view,
  content: layerList,
  expandIconClass: "esri-icon-layer-list",
  expandTooltip: "Layers",
  expanded: false
});

// Add it to the top-left position, index ensures it sits just below Search/Locate
view.ui.add(layerListExpand, { position: "top-left", index: 3 });

    // ----- Focus Mode -----
    let focusOn = false;
    const ORIGINALS = {
      glacialOpacity: glacialGeology.opacity,
      bedrockOpacity: bedrockGeology.opacity,
      poiSize: (poiLayer.renderer?.symbol && Number(poiLayer.renderer.symbol.size)) || 12,
      trailWidthIAT: 2.8, trailWidthCR: 2.6
    };
    const focusBtn = document.getElementById("focusBtn");
    focusBtn.addEventListener("click", () => {
      focusOn = !focusOn;
      focusBtn.textContent = focusOn ? "Show Full Geology" : "Focus Trail";
      if (focusOn) {
        glacialGeology.opacity = 0.25;
        bedrockGeology.opacity  = 0.18;
        const poiR = poiLayer.renderer.clone(); poiR.symbol.size = ORIGINALS.poiSize + 4; poiLayer.renderer = poiR;
        const r = sectionsTop.renderer.clone();
        r.uniqueValueInfos = r.uniqueValueInfos.map((u) => {
          const sym = u.symbol.clone();
          sym.width = (u.value === "Connecting Route") ? 3.2 : 3.6;
          if (u.value === "Connecting Route") sym.style = "dash";
          return { ...u, symbol: sym };
        });
        sectionsTop.renderer = r;
      } else {
        glacialGeology.opacity = ORIGINALS.glacialOpacity;
        bedrockGeology.opacity  = ORIGINALS.bedrockOpacity;
        const poiR = poiLayer.renderer.clone(); poiR.symbol.size = ORIGINALS.poiSize; poiLayer.renderer = poiR;
        const r = sectionsTop.renderer.clone();
        r.uniqueValueInfos = r.uniqueValueInfos.map((u) => {
          const sym = u.symbol.clone();
          sym.width = (u.value === "Connecting Route") ? ORIGINALS.trailWidthCR : ORIGINALS.trailWidthIAT;
          if (u.value === "Connecting Route") sym.style = "dash";
          return { ...u, symbol: sym };
        });
        sectionsTop.renderer = r;
      }
    });

    // ----- When user clicks a trail segment, update Segments tab -----
    view.on("click", function(event){
      view.hitTest(event).then(function(response){
        const result = response.results.find(r => r.graphic && r.graphic.layer === sectionsTop);
        if (!result) return;
        const attrs = result.graphic.attributes || {};
        const segName = attrs.Segment;
        if (segName){
          updateSegmentPanel(segName);
        }
      });
    });

  }); // require
 