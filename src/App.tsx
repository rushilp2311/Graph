import React, { useState, useMemo, useCallback } from "react";
import ForceGraph from "./ForceGraph";
import IdList from "./IdList";
import "./App.css";

function App() {
  const idRelationships = {
    5: new Set([57, 296, 377]),
    57: new Set([5, 296, 506]),
    296: new Set([5, 34, 57]),
    377: new Set([5]),
    25: new Set([143]),
    143: new Set([
      25, 46, 92, 116, 145, 146, 171, 256, 260, 262, 280, 300, 384, 388, 390,
      574, 673, 680,
    ]),
    28: new Set([48]),
    48: new Set([28]),
    32: new Set([114, 117, 379, 638, 639, 681]),
    114: new Set([32, 117, 379, 525, 544, 638]),
    117: new Set([32, 114, 525]),
    379: new Set([32, 114]),
    638: new Set([32, 114, 639, 681, 682]),
    639: new Set([32, 638, 681]),
    681: new Set([32, 638, 639, 682]),
    34: new Set([168, 296, 525]),
    168: new Set([34]),
    525: new Set([34, 114, 117]),
    46: new Set([143]),
    47: new Set([148, 154, 175, 223, 225, 226, 274, 295, 345, 661, 683]),
    148: new Set([47, 345]),
    154: new Set([47, 295]),
    175: new Set([47, 274, 295, 345]),
    223: new Set([47, 295]),
    225: new Set([47, 295]),
    226: new Set([47, 295]),
    274: new Set([47, 175, 295]),
    295: new Set([47, 154, 175, 223, 225, 226, 274, 661, 683]),
    345: new Set([47, 148, 175, 252, 274]),
    661: new Set([47, 173, 295, 513]),
    683: new Set([47, 295]),
    49: new Set([177, 179, 195]),
    177: new Set([49, 157, 179, 190]),
    179: new Set([49, 177, 187, 190, 195]),
    195: new Set([49, 179]),
    52: new Set([353]),
    353: new Set([52, 294]),
    506: new Set([56, 57]),
    60: new Set([161]),
    161: new Set([60]),
    63: new Set([291]),
    291: new Set([63]),
    69: new Set([544]),
    544: new Set([
      69, 78, 103, 114, 116, 146, 171, 176, 231, 256, 260, 280, 300, 384, 388,
      390, 426, 574, 673,
    ]),
    71: new Set([418, 664]),
    418: new Set([71, 417, 664]),
    664: new Set([71, 417, 418]),
    78: new Set([79, 286, 544]),
    79: new Set([78, 543, 665]),
    286: new Set([78, 665]),
    543: new Set([79]),
    665: new Set([79, 286]),
    92: new Set([143, 145]),
    145: new Set([92, 143]),
    97: new Set([103]),
    103: new Set([97, 544]),
    102: new Set([104]),
    104: new Set([105, 382, 102]),
    105: new Set([104]),
    109: new Set([211]),
    211: new Set([109, 459, 526]),
    382: new Set([104]),
    115: new Set([139, 236, 241, 306, 312, 675]),
    139: new Set([115, 236, 239, 306, 308, 310, 475, 480, 481, 482, 483]),
    236: new Set([115, 139, 238, 239, 482]),
    241: new Set([115, 116, 266, 306, 308, 310, 312, 475, 476, 480, 481]),
    306: new Set([115, 139, 241]),
    312: new Set([115, 241]),
    675: new Set([115, 116]),
    116: new Set([143, 241, 544, 675]),
    146: new Set([143, 174, 544]),
    121: new Set([516]),
    516: new Set([121, 311]),
    126: new Set([341]),
    341: new Set([126]),
    132: new Set([164, 166]),
    164: new Set([132, 166]),
    166: new Set([132, 164]),
    136: new Set([174, 271, 299, 328, 340]),
    174: new Set([136, 146, 271, 299, 328]),
    271: new Set([136, 174, 299, 340]),
    299: new Set([136, 174, 271, 328, 340]),
    328: new Set([136, 174, 299, 340]),
    340: new Set([136, 271, 299, 328]),
    239: new Set([139, 236, 238, 482, 483]),
    482: new Set([139, 236, 238, 239, 403, 480, 481]),
    483: new Set([139, 239]),
    238: new Set([236, 239, 482]),
    256: new Set([143, 280, 389, 544]),
    260: new Set([143, 203, 249, 336, 467, 544]),
    262: new Set([143]),
    280: new Set([143, 256, 544]),
    300: new Set([143, 544]),
    384: new Set([143, 544]),
    388: new Set([143, 544]),
    390: new Set([143, 544]),
    574: new Set([143, 544]),
    673: new Set([143, 544]),
    680: new Set([143]),
    144: new Set([676, 677]),
    676: new Set([144, 375, 677]),
    677: new Set([144, 676]),
    153: new Set([186, 318]),
    186: new Set([153, 272]),
    318: new Set([153]),
    252: new Set([345]),
    157: new Set([177, 213]),
    213: new Set([157]),
    171: new Set([143, 544]),
    173: new Set([472, 513, 661]),
    472: new Set([173]),
    513: new Set([173, 661]),
    176: new Set([544]),
    187: new Set([179]),
    190: new Set([177, 179]),
    180: new Set([323]),
    323: new Set([180]),
    183: new Set([185]),
    185: new Set([183]),
    272: new Set([186]),
    191: new Set([192, 235, 326, 339, 365, 467, 529]),
    192: new Set([191, 235, 326, 339, 365, 467, 529]),
    235: new Set([191, 192, 326, 339, 365, 467, 529]),
    326: new Set([191, 192, 235, 339, 365, 467, 529]),
    339: new Set([191, 192, 235, 326, 365, 467, 529]),
    365: new Set([191, 192, 235, 326, 339, 467, 529]),
    467: new Set([191, 192, 203, 235, 249, 260, 326, 339, 365, 529]),
    529: new Set([191, 192, 235, 326, 339, 365, 467]),
    194: new Set([261, 275, 375]),
    261: new Set([194, 275, 375]),
    275: new Set([261, 375]),
    375: new Set([261, 275, 676, 303]),
    197: new Set([268]),
    268: new Set([197, 208, 217, 257, 351]),
    203: new Set([249, 260, 336, 467]),
    249: new Set([203, 260, 336, 467]),
    336: new Set([203, 249, 260]),
    208: new Set([268]),
    459: new Set([211]),
    526: new Set([211]),
    217: new Set([268]),
    227: new Set([437]),
    437: new Set([227]),
    230: new Set([660]),
    660: new Set([230]),
    231: new Set([544]),
    240: new Set([634]),
    634: new Set([240]),
    266: new Set([241]),
    308: new Set([139, 241]),
    310: new Set([139, 241]),
    475: new Set([139, 241]),
    476: new Set([241]),
    480: new Set([139, 241, 482]),
    481: new Set([139, 241, 482]),
    242: new Set([287, 552]),
    287: new Set([242, 243, 244, 245, 246, 282, 570, 571, 572, 573]),
    552: new Set([242]),
    243: new Set([287]),
    244: new Set([287]),
    245: new Set([287]),
    246: new Set([287]),
    257: new Set([268]),
    258: new Set([322]),
    322: new Set([258]),
    270: new Set([667]),
    667: new Set([270]),
    278: new Set([297]),
    297: new Set([278]),
    282: new Set([287]),
    570: new Set([287]),
    571: new Set(),
    572: new Set([287]),
    573: new Set([287]),
    293: new Set([294]),
    294: new Set([293, 353]),
    303: new Set([375]),
    311: new Set([516]),
    351: new Set([268]),
    389: new Set([256]),
    403: new Set([482]),
    417: new Set([418, 664]),
    426: new Set([544]),
    578: new Set([579]),
    579: new Set([578]),
    682: new Set([638, 681]),
  };

  const [selectedIds, setSelectedIds] = useState([]); // For graph expansion

  // Extract all unique IDs for the search list
  const allUniqueIds = useMemo(() => {
    const ids = new Set();
    for (const sourceIdStr in idRelationships) {
      ids.add(parseInt(sourceIdStr));
      idRelationships[sourceIdStr].forEach((targetId) => ids.add(targetId));
    }
    return Array.from(ids).sort((a, b) => a - b);
  }, [idRelationships]);

  // Function to generate the graph data (nodes and links) based on selectedIds
  const generateGraphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeIdsInSubgraph = new Set(); // To track nodes already added to the subgraph

    if (selectedIds.length === 0) {
      // If no IDs are selected, show the full graph
      for (const sourceIdStr in idRelationships) {
        const sourceId = parseInt(sourceIdStr);
        if (!nodeIdsInSubgraph.has(sourceId)) {
          nodes.push({ id: sourceId });
          nodeIdsInSubgraph.add(sourceId);
        }
        idRelationships[sourceIdStr].forEach((targetId) => {
          if (!nodeIdsInSubgraph.has(targetId)) {
            nodes.push({ id: targetId });
            nodeIdsInSubgraph.add(targetId);
          }
          const isLinkExist = links.some(
            (link) =>
              (link.source === sourceId && link.target === targetId) ||
              (link.source === targetId && link.target === sourceId),
          );
          if (!isLinkExist) {
            links.push({ source: sourceId, target: targetId });
          }
        });
      }
    } else {
      // If IDs are selected, build a subgraph including them and their direct connections
      const nodesToProcess = new Set(selectedIds);
      const visitedNodes = new Set(); // Prevent infinite loops in circular relationships

      nodesToProcess.forEach((mainId) => {
        if (visitedNodes.has(mainId)) return;
        visitedNodes.add(mainId);

        if (!nodeIdsInSubgraph.has(mainId)) {
          nodes.push({ id: mainId, isSelected: selectedIds.includes(mainId) });
          nodeIdsInSubgraph.add(mainId);
        }

        // Add outgoing connections
        const connectedFromMain = idRelationships[mainId] || new Set();
        connectedFromMain.forEach((targetId) => {
          if (!nodeIdsInSubgraph.has(targetId)) {
            nodes.push({ id: targetId });
            nodeIdsInSubgraph.add(targetId);
          }
          const isLinkExist = links.some(
            (link) =>
              (link.source === mainId && link.target === targetId) ||
              (link.source === targetId && link.target === mainId),
          );
          if (!isLinkExist) {
            links.push({ source: mainId, target: targetId });
          }
        });

        // Add incoming connections (where mainId is a target)
        for (const sourceIdStr in idRelationships) {
          const sourceId = parseInt(sourceIdStr);
          if (idRelationships[sourceIdStr].has(mainId) && sourceId !== mainId) {
            if (!nodeIdsInSubgraph.has(sourceId)) {
              nodes.push({ id: sourceId });
              nodeIdsInSubgraph.add(sourceId);
            }
            const isLinkExist = links.some(
              (link) =>
                (link.source === sourceId && link.target === mainId) ||
                (link.source === mainId && link.target === sourceId),
            );
            if (!isLinkExist) {
              links.push({ source: sourceId, target: mainId });
            }
          }
        }
      });
    }
    return { nodes, links };
  }, [selectedIds, idRelationships]);

  // Handler for clicking an ID in the sidebar list (replaces current selection)
  const handleIdListClick = useCallback((id) => {
    setSelectedIds([id]); // Select only this ID
  }, []);

  // Handler for "Show All Graph" button
  const handleShowAllGraph = useCallback(() => {
    setSelectedIds([]); // Clear selection to show full graph
  }, []);

  // Handler for clicking a node in the ForceGraph (expands selection)
  const handleNodeClickInGraph = useCallback((nodeId) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(nodeId)) {
        return prevSelectedIds.filter((id) => id !== nodeId);
      } else {
        return [...prevSelectedIds, nodeId];
      }
    });
  }, []);

  return (
    <div className="App">
      <IdList
        uniqueIds={allUniqueIds}
        onIdClick={handleIdListClick}
        onShowAllGraph={handleShowAllGraph}
        selectedIds={selectedIds}
      />
      <div
        style={{
          marginLeft: "200px",
          width: "calc(100vw - 200px)",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <ForceGraph
          data={generateGraphData}
          onNodeClick={handleNodeClickInGraph}
        />
      </div>
    </div>
  );
}

export default App;
