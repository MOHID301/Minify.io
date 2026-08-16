// Image Scale - Simple JavaScript

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

const controls = document.getElementById("controls");
const resultsSection = document.getElementById("resultsSection");
const results = document.getElementById("results");

const formatSelect = document.getElementById("formatSelect");
const qualitySlider = document.getElementById("qualitySlider");
const qualityValue = document.getElementById("qualityValue");

const maxWidth = document.getElementById("maxWidth");
const maxHeight = document.getElementById("maxHeight");

const processBtn = document.getElementById("processBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const clearBtn = document.getElementById("clearBtn");

let files = [];


// -----------------------------
// Select files
// -----------------------------

dropzone.addEventListener("click", function () {
    fileInput.click();
});

fileInput.addEventListener("change", function () {
    addFiles(fileInput.files);
});


// -----------------------------
// Drag & Drop
// -----------------------------

dropzone.addEventListener("dragover", function (event) {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
});

dropzone.addEventListener("dragleave", function () {
    dropzone.classList.remove("is-dragover");
});

dropzone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropzone.classList.remove("is-dragover");

    addFiles(event.dataTransfer.files);
});


// -----------------------------
// Add files
// -----------------------------

function addFiles(newFiles) {

    for (let file of newFiles) {

        if (file.type.startsWith("image/")) {
            files.push(file);
        }
    }

    if (files.length > 0) {

        controls.hidden = false;
        resultsSection.hidden = false;

        showFiles();
    }
}


// -----------------------------
// Show files
// -----------------------------

function showFiles() {

    results.innerHTML = "";

    files.forEach(function (file, index) {

        const row = document.createElement("div");

        row.className = "row";

        const imageURL = URL.createObjectURL(file);

        row.innerHTML = `
            <div class="row-thumb">
                <img src="${imageURL}" alt="">
            </div>

            <div class="row-main">

                <p class="row-name">
                    ${file.name}
                </p>

                <div class="row-meter">
                    <div class="row-meter-fill"></div>
                </div>

                <div class="row-sizes">

                    <span class="mono">
                        ${formatSize(file.size)}
                    </span>

                    <span>
                        →
                    </span>

                    <span class="mono" id="new-size-${index}">
                        —
                    </span>

                </div>

            </div>

            <div class="row-actions">

                <a
                    id="download-${index}"
                    class="row-download"
                    hidden
                >
                    Download
                </a>

                <button
                    class="row-remove"
                    onclick="removeFile(${index})"
                >
                    ✕
                </button>

            </div>
        `;

        results.appendChild(row);
    });
}


// -----------------------------
// Remove file
// -----------------------------

function removeFile(index) {

    files.splice(index, 1);

    showFiles();

    if (files.length === 0) {

        controls.hidden = true;
        resultsSection.hidden = true;
    }
}


// -----------------------------
// Quality slider
// -----------------------------

qualitySlider.addEventListener("input", function () {

    qualityValue.textContent = qualitySlider.value;
});


// -----------------------------
// Compress / Convert         
// -----------------------------

processBtn.addEventListener("click", function () {

    if (files.length === 0) {

        alert("Please select an image.");

        return;
    }

    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    let completed = 0;

    files.forEach(function (file, index) {

        const image = new Image();

        image.onload = function () {

            let width = image.width;
            let height = image.height;


            // -------------------------
            // Max width
            // -------------------------

            const maxW = parseInt(maxWidth.value);

            if (maxW && width > maxW) {

                height = Math.round(
                    height * (maxW / width)
                );

                width = maxW;
            }


            // -------------------------
            // Max height
            // -------------------------

            const maxH = parseInt(maxHeight.value);

            if (maxH && height > maxH) {

                width = Math.round(
                    width * (maxH / height)
                );

                height = maxH;
            }


            // -------------------------
            // Canvas
            // -------------------------

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");


            // JPEG needs white background

            if (formatSelect.value === "image/jpeg") {

                ctx.fillStyle = "#ffffff";

                ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );
            }


            // Draw image

            ctx.drawImage(
                image,
                0,
                0,
                width,
                height
            );


            // -------------------------
            // Format
            // -------------------------

            let format = formatSelect.value;

            if (format === "original") {

                format = file.type;

                // Canvas doesn't support GIF/BMP output
                if (
                    format !== "image/jpeg" &&
                    format !== "image/png" &&
                    format !== "image/webp"
                ) {
                    format = "image/png";
                }
            }


            // -------------------------
            // Quality
            // -------------------------

            const quality =
                parseInt(qualitySlider.value) / 100;


            // -------------------------
            // Create new image
            // -------------------------

            canvas.toBlob(function (blob) {

                if (!blob) {

                    alert(
                        "Could not process " +
                        file.name
                    );

                    return;
                }


                // Download URL

                const url =
                    URL.createObjectURL(blob);


                const download =
                    document.getElementById(
                        "download-" + index
                    );


                // File extension

                let extension = "png";

                if (format === "image/jpeg") {
                    extension = "jpg";
                }

                if (format === "image/webp") {
                    extension = "webp";
                }


                // New filename

                const name =
                    file.name.replace(
                        /\.[^/.]+$/,
                        ""
                    );


                download.href = url;

                download.download =
                    name + "." + extension;

                download.hidden = false;


                // New size

                document.getElementById(
                    "new-size-" + index
                ).textContent =
                    formatSize(blob.size);


                completed++;


                // Finished

                if (completed === files.length) {

                    processBtn.disabled = false;

                    processBtn.textContent =
                        "Compress & Convert";
                }

            }, format, quality);
        };


        image.src =
            URL.createObjectURL(file);
    });
});


// -----------------------------
// Clear
// -----------------------------

clearBtn.addEventListener("click", function () {

    files = [];

    results.innerHTML = "";

    fileInput.value = "";

    controls.hidden = true;

    resultsSection.hidden = true;

    downloadAllBtn.hidden = true;
});


// -----------------------------
// Download all
// -----------------------------

downloadAllBtn.addEventListener("click", function () {

    if (typeof JSZip === "undefined") {

        alert("ZIP library not loaded.");

        return;
    }

    alert("ZIP download can be added later.");
});


// -----------------------------
// Format file size
// -----------------------------

function formatSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";
    }

    return (
        bytes / (1024 * 1024)
    ).toFixed(1) + " MB";
}