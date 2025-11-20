
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

     // ----- Segment content (start with Iola Ski Hill Segment) -----
    const segmentContent = {
      "New Hope": {
        overview: `
          <p>The Iola Ski Hill segment sits where ancient granite bedrock meets
          young glacial deposits. It’s an excellent place to show students how
          very old rocks and very recent glacial processes work together to shape
          Wisconsin’s hills and valleys.</p>
        `,
        bedrock: `
          <p><strong>Wolf River Granite</strong> and <strong>Red River Adamellite</strong>
          form the “basement rock” beneath this segment. These Middle Proterozoic
          intrusive rocks are about 1.5 billion years old, cooled slowly from magma
          deep underground, and now support the glacial hills above.</p>
          <p><em>Kid version:</em> These hills sit on extremely old granite that formed
          like fudge cooling deep inside the Earth—long before dinosaurs existed.</p>
        `,
        glacial: `
          <p>Late Pleistocene glaciers covered this area, leaving behind
          <strong>morainal glacial sediment (Holy Hill Formation)</strong> and
          <strong>collapsed meltwater-stream sediment</strong>. As the ice paused,
          it built ridges of sandy till. Where meltwater streams flowed over buried ice
          and that ice later melted, the ground sagged into hummocky, pitted terrain.</p>
          <p><em>Kid version:</em> A giant glacier dropped piles of sand and rocks and
          left lumpy hills and bowl-shaped holes when buried ice chunks melted.</p>
        `,
        pois: `
          <ul>
            <li><strong>Pitted Outwash</strong> – Sandy plain with scattered pits where
            buried ice melted and the ground collapsed into kettles.</li>
            <li><strong>New Hope–Iola – Ice-Walled Lake Plain #1</strong> – Flat-topped
            ridge that was once the muddy bottom of a lake held inside walls of ice.</li>
            <li><strong>New Hope–Iola – Scenic Overlook</strong> – High vantage point for
            viewing the hummock–kettle terrain and discussing glacial landscapes.</li>
            <li><strong>New Hope–Iola – Hummock Field #1</strong> – Cluster of lumpy hills
            formed as debris-covered ice melted in place.</li>
          </ul>
        `,
        conceptsHtml: `
          <p>This segment pairs well with lessons on:</p>
          <ul>
            <li>Moraines and glacial till</li>
            <li>Pitted outwash and kettles</li>
            <li>Ice-walled lake plains</li>
            <li>Hummocky topography from melting buried ice</li>
            <li>Intrusive igneous rocks (granite) and the Wolf River Batholith</li>
          </ul>
        `,
        activitiesHtml: `
          <ul>
            <li><strong>Blanket Moraine Demo (10 min):</strong> Use a blanket and books to
            model how glaciers push material into moraines.</li>
            <li><strong>Buried Ice &amp; Kettles Model (15–20 min):</strong> Use ice cubes
            and sand in a clear container to show how melting buried ice forms kettles.</li>
            <li><strong>Overlook Landscape Sketch (20–30 min):</strong> Sketch the
            hummock–kettle terrain from the scenic overlook and label likely glacial features.</li>
          </ul>
        `
      },
      "Kettlebowl": {
  overview: `
    <p>The Kettlebowl Segment is one of the best places on the Ice Age Trail
    to help students visualize what happens when a glacier melts in place.
    This landscape is filled with kettles, hummocks, and collapse features,
    all created during a period of glacial stagnation at the margin of the
    Langlade Lobe. Students can literally walk across the remnants of a melting
    ice mass and see how uneven the land becomes when buried ice slowly disappears.</p>
  `,

  bedrock: `
    <p>The underlying bedrock here is <strong>Wolf River Granite</strong>,
    a Middle Proterozoic intrusive rock about 1.5 billion years old.
    This granite cooled slowly deep beneath the Earth’s surface and contains
    distinctive round feldspar crystals (rapakivi texture). Although mostly covered
    by glacial sediments in this segment, it forms the solid “basement” that the
    glacial features sit on.</p>

    <p><em>Kid version:</em> Far below your feet is one of Wisconsin’s oldest rocks—
    a red granite that formed like slow-cooling fudge deep underground, long before
    plants or animals lived on land.</p>
  `,

  glacial: `
    <p>The Kettlebowl landscape is dominated by Late Pleistocene deposits of the
    <strong>Copper Falls Formation</strong>, a reddish-brown sandy material left behind
    by the retreating Langlade Lobe. This material forms the uneven hills, hollows,
    and ridges that make this area feel especially “bumpy.”</p>

    <p>Much of the rugged terrain comes from
    <strong>collapsed meltwater-stream sediment</strong>: sand and gravel
    deposited by fast-flowing meltwater streams that ran across buried ice.
    When those ice blocks melted, the surface collapsed into closed depressions,
    creating kettles, pits, and hummocky topography.</p>

    <p><em>Kid version:</em> Imagine pouring sand onto a giant block of ice.
    When the ice melts, the sand suddenly drops and makes big holes and lumpy hills.
    That’s exactly what happened here.</p>
  `,

  pois: `
    <ul>
      <li><strong>Kettle</strong> – A steep-sided, bowl-shaped depression formed when a
      block of glacier ice was buried in sand and gravel. After the ice melted,
      the surface collapsed. The cluster of kettles here shows that the glacier
      melted unevenly and left behind many ice blocks.</li>

      <li><strong>Big Stone Hole</strong> – A very large, dramatic kettle formed when a
      massive buried ice block melted and the ground above collapsed into a deep pit.
      This is one of the most striking examples of collapse topography along the segment.</li>

      <li><strong>Summit Lake Moraine</strong> – The northern part of the segment follows
      the crest of this moraine, built at the margin of the Langlade Lobe. As the glacier
      paused, it pushed and piled sediment into a curving ridge that marks an ancient
      ice-front boundary. Walking this ridge is like walking the old edge of the glacier.</li>
    </ul>
  `,

  conceptsHtml: `
    <p>This segment pairs especially well with lessons on:</p>
    <ul>
      <li>Kettles and collapse topography</li>
      <li>Hummocky terrain from melting buried ice</li>
      <li>Moraines (Summit Lake Moraine)</li>
      <li>Pitted outwash plains</li>
      <li>Glacial stagnation and ice-block melting</li>
      <li>Ancient granitic bedrock (Wolf River Batholith)</li>
    </ul>
  `,

  activitiesHtml: `
    <ul>
      <li><strong>Buried Ice & Kettles Model (15–20 min):</strong> Use ice cubes and sand
      to show how melting buried ice forms kettles and collapse pits.</li>

      <li><strong>“Find the Ice Blocks” Mapping Challenge (on-trail):</strong> Have students
      identify kettles along the trail and guess where the buried ice used to be. Sketch
      or mark guesses on a simple field map.</li>

      <li><strong>Moraine Ridge Walk (10–15 min):</strong> At the Summit Lake Moraine,
      challenge students to notice rises and dips in the ridge crest and discuss how
      the glacier built uneven piles of sediment.</li>

      <li><strong>Hummock vs. Kettle Sorting Game (classroom):</strong> Show photos of
      lumpy hills vs bowl-shaped depressions and let students sort them into glacial
      feature categories.</li>
    </ul>
  `
}
    };

    const segIntroEl      = document.getElementById("segIntro");
    const segDetailsEl    = document.getElementById("segDetails");
    const segTitleTextEl  = document.getElementById("segTitleText");
    const segOverviewEl   = document.getElementById("segOverview");
    const segBedrockEl    = document.getElementById("segBedrock");
    const segGlacialEl    = document.getElementById("segGlacial");
    const segPOIsEl       = document.getElementById("segPOIs");
    const segConceptsEl   = document.getElementById("segConceptsLinks");

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
      segOverviewEl.innerHTML   = data.overview;
      segBedrockEl.innerHTML    = data.bedrock;
      segGlacialEl.innerHTML    = data.glacial;
      segPOIsEl.innerHTML       = data.pois;
      segConceptsEl.innerHTML   = data.conceptsHtml;

      // Also populate Activities tab with segment-specific recommendations at the top
      if (activitiesListEl){
        activitiesListEl.innerHTML = `
          <p><strong>Recommended activities for ${segmentName}:</strong></p>
          ${data.activitiesHtml}
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
      eduToggle.setAttribute("aria-expanded", String(!collapsed));
      eduToggle.textContent = collapsed ? "Show" : "Hide";
      syncPadding();
    });

    headerEduBtn.addEventListener("click", () => {
      if (appRoot.classList.contains("collapsed")){
        appRoot.classList.remove("collapsed");
        eduToggle.setAttribute("aria-expanded", "true");
        eduToggle.textContent = "Hide";
        syncPadding();
      } else {
        // If already open, scroll to top for convenience
        eduSide.querySelector('.eduSide__body')?.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
 