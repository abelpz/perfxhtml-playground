import "./styles.css";
import perf2html from "./perf2html";
import html2perf from "./html2perf";
import isEqual from "lodash.isequal";

import marcDoc from "./perf/mrk_perf.json";
import psalmsDoc from "./perf/psa_perf_v0.2.0.json";

const perfDocuments = {
  marc: {
    name: "Marc (fra - no alignment)",
    doc: marcDoc
  },
  psalms: {
    name: "Psalms (eng - with alignment)",
    doc: psalmsDoc
  }
};

const nav = document.querySelector("nav#files");
Object.keys(perfDocuments).forEach((doc) => {
  const button = document.createElement("button");
  button.innerHTML = perfDocuments[doc].name;
  button.onclick = (e) => {
    renderPerf(perfDocuments[doc].doc);
  };
  nav.appendChild(button);
});

const renderPerf = (perfDocument) => {
  document.getElementById("title").innerHTML =
    perfDocument.metadata.document.toc;
  console.time("Roundtrip time");
  const sequenceId = perfDocument["main_sequence_id"];
  const perfHtml = {
    mainSequenceId: sequenceId,
    schema: perfDocument.schema,
    metadata: perfDocument.metadata,
    sequencesHtml: Object.keys(perfDocument.sequences).reduce(
      (sequences, seqId) => {
        sequences[seqId] = perf2html(perfDocument, seqId);
        return sequences;
      },
      {}
    )
  };
  document.getElementById("book-content").innerHTML =
    perfHtml.sequencesHtml[sequenceId];

  const htmlPerf = html2perf(perfHtml, sequenceId);
  console.log(
    isEqual(htmlPerf, perfDocument.sequences[sequenceId])
      ? "Roundtrip succeeded"
      : "Rountrip failed"
  );

  if (htmlPerf) console.timeEnd("Roundtrip time");

  const parsedSequence = new DOMParser()
    .parseFromString(perfHtml.sequencesHtml[sequenceId], "text/html")
    .querySelector(".sequence");

  console.log(perfHtml);
  console.log(parsedSequence);
};
