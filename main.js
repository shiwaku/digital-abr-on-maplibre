const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  style: "dark.json",
  center: [139.999, 35.659],
  zoom: 8.17,
  maxPitch: 85,
  pitch: 0,
  bearing: 0,
  hash: true,
  attributionControl: false,
});

//ジオコーダー（国土地理院 地名検索API）
var geocoder_api = {
  forwardGeocode: async (config) => {
    const features = [];
    const Text_Prefix = config.query.substr(0, 3);
    try {
      let request =
        "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" +
        config.query;
      const response = await fetch(request);
      const geojson = await response.json();

      for (var i = 0; i < geojson.length; i++) {
        if (geojson[i].properties.title.indexOf(Text_Prefix) !== -1) {
          let point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: geojson[i].geometry.coordinates,
            },
            place_name: geojson[i].properties.title,
            properties: geojson[i].properties,
            text: geojson[i].properties.title,
            place_type: ["place"],
            center: geojson[i].geometry.coordinates,
          };
          features.push(point);
        }
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }
    return {
      features: features,
    };
  },
};
map.addControl(
  new MaplibreGeocoder(geocoder_api, { maplibregl: maplibregl }),
  "top-right"
);

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.FullscreenControl());
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: false },
    fitBoundsOptions: { maxZoom: 18 },
    trackUserLocation: true,
    showUserLocation: true,
  })
);
map.addControl(new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }));
map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
    customAttribution:
      '（<a href="https://twitter.com/shi__works" target="_blank">X(旧Twitter)</a> | ' +
      '<a href="https://github.com/shiwaku/digital-abr-on-maplibre" target="_blank">GitHub</a>）',
  })
);

const layerIds = ["town-point-1", "fude-polygon"];

map.on("load", () => {
  // 法務省地図XMLベクトルタイル
  map.addSource("moj-xml", {
    type: "vector",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/moj-xml/a.pmtiles",
    attribution:
      '<a href="https://github.com/amx-project">法務省地図XML（amx-project）</a>',
  });

  /*
  // 法務省地図ベクトルタイル
  map.addSource("moj-xml", {
    type: "vector",
    // url: "pmtiles://https://data.source.coop/smartmaps/amx-2024-04/MojMap_amx_2024.pmtiles",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/moj-xml/MojMap_amx_2024.pmtiles",
    attribution:
      '<a href="https://github.com/amx-project">法務省地図XML（amx-project）</a>',
  });
  */

  /*
  // 法務省地図レイヤー（ポリゴン）
  map.addLayer({
    id: "fude-polygon",
    source: "moj-xml",
    "source-layer": "fude",
    type: "fill",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "#FFF2CC",
      "fill-opacity": 0.2,
    },
  });

  // 法務省地図レイヤー（ライン）
  map.addLayer({
    id: "fude-line",
    source: "moj-xml",
    "source-layer": "fude",
    type: "line",
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": "#FF0000",
      "line-width": 1.2,
    },
  });
  */

  // 代表点レイヤー
  map.addLayer({
    id: "daihyo-1",
    source: "moj-xml",
    "source-layer": "daihyo",
    type: "circle",
    minzoom: 8,
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": "#00FFFF",
      "circle-radius": 10,
      "circle-blur": 3,
      "circle-opacity": 0.8,
    },
  });

  // 代表点レイヤー
  map.addLayer({
    id: "daihyo-2",
    source: "moj-xml",
    "source-layer": "daihyo",
    type: "circle",
    minzoom: 8,
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": "#00FFFF",
      "circle-radius": 5,
      "circle-blur": 3,
      "circle-opacity": 0.8,
    },
  });

  // 代表点レイヤー
  map.addLayer({
    id: "daihyo-3",
    source: "moj-xml",
    "source-layer": "daihyo",
    type: "circle",
    minzoom: 8,
    layout: {
      visibility: "none",
    },
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": 1.5,
      "circle-blur": 0,
      "circle-opacity": 1,
    },
  });

  // 筆レイヤ（ポリゴン）
  map.addLayer({
    id: "fude-polygon",
    source: "moj-xml",
    "source-layer": "fude",
    type: "fill",
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": "#CCF2FF",
      "fill-opacity": 0.2,
    },
  });

  // 筆レイヤ（ライン）
  map.addLayer({
    id: "fude-line",
    source: "moj-xml",
    "source-layer": "fude",
    type: "line",
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "#00FFFF",
      "line-width": 0.75,
    },
  });

  // デジ庁ABRベクトルタイル
  map.addSource("abr", {
    type: "vector",
    // url: "pmtiles://https://shiworks2.xsrv.jp/pmtiles/digital/abr/address.pmtiles",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/digital/address.pmtiles",
    attribution:
      '<a href="https://catalog.registries.digital.go.jp/rc/dataset/">デジタル庁 アドレス・ベース・レジストリ(町字データ)を加工して作成</a>',
  });

  // 町字マスターヒートマップ (rsdt_addr_flg == 0)
  map.addLayer({
    id: "town-heatmap-0",
    type: "heatmap",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    minzoom: 4,
    maxzoom: 8,
    filter: ["==", ["to-number", ["get", "rsdt_addr_flg"]], 0],
    paint: {
      "heatmap-weight": 1,
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 1.5, 8, 4],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(  0,255,  0,0)",
        0.05,
        "rgba( 64,255, 64,0.4)",
        0.15,
        "rgba(128,255, 32,0.6)",
        0.35,
        "rgba(192,255, 16,0.8)",
        0.6,
        "rgba(255,255,  0,0.9)",
        1,
        "rgba(255,255,128,1)",
      ],
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 4, 8, 6],
      "heatmap-opacity": 0.6,
    },
  });

  // 町字マスターヒートマップ (rsdt_addr_flg == 1)
  map.addLayer({
    id: "town-heatmap-1",
    type: "heatmap",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    minzoom: 4,
    maxzoom: 8,
    filter: ["==", ["to-number", ["get", "rsdt_addr_flg"]], 1],
    paint: {
      "heatmap-weight": 1,
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 2, 8, 4],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(255,  0,255,0)",
        0.05,
        "rgba(255,190,220,0.4)",
        0.15,
        "rgba(255,140,210,0.6)",
        0.35,
        "rgba(255, 85,200,0.8)",
        0.6,
        "rgba(255, 40,180,0.9)",
        1,
        "rgba(255,  0,170,1)",
      ],
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 4, 8, 6],
      "heatmap-opacity": 0.6,
    },
  });

  // 町字マスターポイントレイヤ
  map.addLayer({
    id: "town-point-1",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    type: "circle",
    minzoom: 8,
    paint: {
      "circle-color": [
        "case",
        ["==", ["to-number", ["get", "rsdt_addr_flg"]], 1],
        "#FF00FF",
        "#00ff37",
      ],
      // "circle-radius": 15,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        5,
        10,
        10,
        14,
        15,
      ],
      "circle-blur": 3,
      "circle-opacity": 0.8,
    },
  });

  // 町字マスターポイントレイヤ
  map.addLayer({
    id: "town-point-2",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    type: "circle",
    minzoom: 8,
    paint: {
      "circle-color": [
        "case",
        ["==", ["to-number", ["get", "rsdt_addr_flg"]], 1],
        "#FF00FF",
        "#00ff37",
      ],
      // "circle-radius": 7.5,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        2,
        10,
        5,
        14,
        7.5,
      ],
      "circle-blur": 3,
      "circle-opacity": 0.8,
    },
  });

  // 町字マスターポイントレイヤ
  map.addLayer({
    id: "town-point-3",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    type: "circle",
    minzoom: 8,
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        0.75,
        8,
        1,
        12,
        1.25,
        16,
        1.5,
      ],
      "circle-blur": 0,
      "circle-opacity": 1,
    },
  });

  // 都道府県ラベルレイヤ
  map.addLayer({
    id: "pref-label",
    type: "symbol",
    source: "abr",
    "source-layer": "out_mt_pref_all_with_pos",
    minzoom: 4,
    maxzoom: 8,
    layout: {
      "text-field": ["get", "pref"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 12, 8, 14],
      "text-font": ["NotoSansJP-Regular", "NotoSerifJP-Medium"],
      "text-anchor": "bottom",
      "text-offset": [0, 0],
      "text-allow-overlap": ["step", ["zoom"], false, 16, true],
    },
    paint: {
      "text-color": "rgb(255,255,255)",
      "text-halo-color": "rgb(0,0,0)",
      "text-halo-width": 1,
    },
  });

  // 市区町村ラベルレイヤ
  map.addLayer({
    id: "city-label",
    type: "symbol",
    source: "abr",
    "source-layer": "out_mt_city_all_with_pos",
    minzoom: 8,
    maxzoom: 23,
    layout: {
      "text-field": ["concat", ["get", "city"], ["get", "ward"]],
      "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 12, 13],
      "text-font": ["NotoSansJP-Regular", "NotoSerifJP-Medium"],
      "text-anchor": "bottom",
      "text-offset": [0, 0],
      "text-allow-overlap": ["step", ["zoom"], false, 16, true],
    },
    paint: {
      "text-color": "rgb(255,255,255)",
      "text-halo-color": "rgb(0,0,0)",
      "text-halo-width": 1,
    },
  });

  // 町字ラベルレイヤ
  map.addLayer({
    id: "town-label",
    type: "symbol",
    source: "abr",
    "source-layer": "out_mt_town_fullset_with_pos",
    minzoom: 14,
    maxzoom: 23,
    layout: {
      // "text-field": ["concat", ["get", "oaza_cho"], ["get", "chome"]],
      "text-field": [
        "concat",
        [
          "case",
          ["all", ["has", "oaza_cho"], ["!=", ["get", "oaza_cho"], ""]],
          ["get", "oaza_cho"],
          ["get", "koaza"],
        ],
        ["get", "chome"],
      ],
      "text-size": ["interpolate", ["linear"], ["zoom"], 14, 14, 20, 16],
      "text-font": ["NotoSerifJP-SemiBold"],
      "text-anchor": "bottom",
      "text-offset": [0, -1],
      // "text-allow-overlap": ["step", ["zoom"], false, 16, true],
    },
    paint: {
      "text-color": [
        "case",
        ["==", ["to-number", ["get", "rsdt_addr_flg"]], 1],
        "#CB00CB",
        "#006500",
      ],
      "text-halo-color": "rgb(255,255,255)",
      "text-halo-width": 1.5,
    },
  });

  map.showTileBoundaries = false;

  setupLayerSwitches();

  layerIds.forEach(addPopupHandler);
});

function setupLayerSwitches() {
  document.querySelectorAll(".layer-switch").forEach((input) => {
    input.addEventListener("change", () => {
      input.dataset.layer
        .split(",")
        .map((id) => id.trim())
        .forEach((layer) => {
          map.setLayoutProperty(
            layer,
            "visibility",
            input.checked ? "visible" : "none"
          );
        });
    });
  });
}

function addPopupHandler(layerId) {
  map.on("click", layerId, (e) => {
    // クリック位置に描画されている同一レイヤーの全フィーチャを取得
    const features = map.queryRenderedFeatures(e.point, {
      layers: [layerId],
    });
    if (!features.length) return;

    // ポップアップ設置位置
    const coords = [e.lngLat.lng, e.lngLat.lat];
    // コンテナ要素
    const container = document.createElement("div");

    features.forEach((feature, idx) => {
      // 各フィーチャの見出し（レイヤー名＋番号）
      const title = document.createElement("h4");
      // title.textContent = `町字マスター`;
      title.style.margin = "4px 0 2px";
      title.style.fontSize = "90%";
      container.appendChild(title);

      // 属性テーブル
      const table = document.createElement("table");
      table.className = "popup-table";
      table.innerHTML =
        "<tr><th>属性</th><th>値</th></tr>" +
        Object.entries(feature.properties)
          .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
          .join("");
      container.appendChild(table);
    });

    // ポップアップ表示
    new maplibregl.Popup({ maxWidth: "300px" })
      .setLngLat(coords)
      .setDOMContent(container)
      .addTo(map);
  });
}
