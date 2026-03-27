const uploadBox = document.querySelector(".upload-box");
const uploadText = document.getElementById("uploadText");
const uploadStatus = document.getElementById("uploadStatus");
const extractButton = document.getElementById("extractButton");
const fileInfo = document.getElementById("fileInfo");
const imageInput = document.getElementById("imageInput");
const previewSection = document.querySelector(".preview");
const imagePreview = document.getElementById("imagePreview");
const exifSection = document.querySelector(".exif-data");
const exifOutput = document.getElementById("exifOutput");
const exportSection = document.querySelector(".export");
const exportButton = document.getElementById("exportButton");
const exportFormat = document.getElementById("exportFormat");
let exifDataStore = {};
const removeSection = document.querySelector(".remove-exif");
const removeBtn = document.getElementById("removeExifBtn");
let uploadedImage = null;

function showError(message) {
    uploadText.textContent = "Invalid File Type - Click again to try another file.";
    fileInfo.textContent = message;

    uploadStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Upload Failed';
    uploadStatus.classList.add("error");
    uploadStatus.classList.remove("success");

    uploadBox.classList.add("error");
    uploadBox.classList.remove("success");

    imageInput.value = ""; /* Reset file input */
}

/* When user selects a file */
imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    /* File Type Validation */
    const isJPG = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");
    const isTIFF = fileName.endsWith(".tif") || fileName.endsWith(".tiff");

    if (fileName.endsWith(".png")) {
        showError("PNG files are not supported - Only .jpg, .jpeg, .tif, .tiff files can be uploaded.");
        return;
    }

     if (fileName.endsWith(".heic")) {
        showError("HEIC files are not supported - Only .jpg, .jpeg, .tif, .tiff files can be uploaded.");
        return;
    }

    if (fileName.endsWith(".gif")) {
        showError("GIF files are not supported - Only .jpg, .jpeg, .tif, .tiff files can be uploaded.");
        return;
    }

    if (fileName.endsWith(".webp")) {
        showError("WEBP files are not supported - Only .jpg, .jpeg, .tif, .tiff files can be uploaded.");
        return;
    }

    if (!isJPG && !isTIFF) {
        showError("Unsupported file type - Only .jpg, .jpeg, .tif, .tiff files can be uploaded.");
        return;
    }

    uploadBox.classList.remove("error");
    uploadBox.classList.add("success");

    uploadText.textContent = "Upload Complete";
    fileInfo.textContent = file.name;

    uploadStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Ready for EXIF extraction';
    
    uploadStatus.classList.add("success");
    uploadStatus.classList.remove("error");

    /* Store image for EXIF Remove */
    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedImage = new Image();
        uploadedImage.src = e.target.result;

        /* Enable remove button */
        removeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
});

/* User clicks extract button */
extractButton.addEventListener("click", function () {

    const file = imageInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    /* Show hidden sections after upload */
    previewSection.style.display = "block";
    exifSection.style.display = "block";
    exportSection.style.display = "block";
    removeSection.style.display = "block";

    previewSection.scrollIntoView({ behavior: "smooth" });

    const reader = new FileReader();

    reader.onload = function (event) {

        /* Clear previous preview */
        imagePreview.innerHTML = "";
        /* Clear previous exif data */
        exifOutput.innerHTML = "";

        const img = document.createElement("img");
        img.src = event.target.result;
        imagePreview.appendChild(img);

        /* Wait for image to load */
        img.onload = function () {

            /* BASIC FILE INFO */
            const basicInfoData = {
                "File Name": file.name,
                "File Size": (file.size / 1024).toFixed(2) + " KB",
                "File Type": file.type,
                "Date Last Modified": new Date(file.lastModified).toLocaleString()
            };

            const basicInfo = `
                <div class="exif-section">
                    <h3>Basic File Information</h3>
                    <table class="exif-table">
                        <tr><th>Property</th><th>Value</th></tr>
                        ${Object.entries(basicInfoData).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
                    </table>
                </div>
            `;

            /* IMAGE PROPERTIES */
            const imagePropsData = {
                "Width": img.naturalWidth + " px",
                "Height": img.naturalHeight + " px"
            };

            const imageProps = `
                <div class="exif-section">
                    <h3>Image Properties</h3>
                    <table class="exif-table">
                        <tr><th>Property</th><th>Value</th></tr>
                        ${Object.entries(imagePropsData).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
                    </table>
                </div>
            `;

            /* EXIF DATA */
            EXIF.getData(img, function () {

                const make = EXIF.getTag(this, "Make");
                const model = EXIF.getTag(this, "Model");
                const dateTaken = EXIF.getTag(this, "DateTimeOriginal");

                const exifData = {
                    "Camera Make": make || "N/A",
                    "Camera Model": model || "N/A",
                    "Date Taken": dateTaken || "N/A",
                    "Exposure Time": EXIF.getTag(this, "ExposureTime") || "N/A",
                    "ISO": EXIF.getTag(this, "ISOSpeedRatings") || "N/A",
                    "Aperture": EXIF.getTag(this, "FNumber") || "N/A",
                    "Focal Length": EXIF.getTag(this, "FocalLength") || "N/A",
                    "Software": EXIF.getTag(this, "Software") || "N/A",
                };

                const lat = EXIF.getTag(this, "GPSLatitude");
                const lon = EXIF.getTag(this, "GPSLongitude");
                let gps = "Not available";

                if (lat && lon) {
                    gps = lat.join(", ") + " / " + lon.join(", ");
                }

                exifData["GPS Location"] = gps;

                /* Store data for export*/
                exifDataStore = {
                    basic: basicInfoData,
                    image: imagePropsData,
                    exif: exifData
                };

                let exifDataSection = `<div class="exif-section"><h3>EXIF Metadata</h3>`;

                 if (!make && !model && !dateTaken) {
                    exifDataSection += `<p>No EXIF data found.</p>`;
                } else {
                    exifDataSection += `
                        <table class="exif-table">
                            <tr><th>Property</th><th>Value</th></tr>
                            ${Object.entries(exifData).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
                        </table>
                    `;
                }

                /* FINAL OUTPUT */
                exifDataSection += `</div>`;

                exifOutput.innerHTML = basicInfo + imageProps + exifDataSection;
            });
        };
    };

    reader.readAsDataURL(file);
});



/* Export Function */
exportButton.addEventListener("click", function () {

    if (!exifDataStore || Object.keys(exifDataStore).length === 0) {
        alert("No EXIF data to export.");
        return;
    }

    const format = exportFormat.value;

    if (!format) {
        alert("Please select an export format.");
        return;
    }

    const originalFileName = imageInput.files[0].name;
    const baseFileName = originalFileName.replace(/\.[^/.]+$/, ""); /* Removes .jpg, .jpeg, .tif, etc. from file name */
    const fileName = `${baseFileName}-exif-data`; /* Sets file name */

    /* JSON */
    if (format === "json") {
        const content = JSON.stringify(exifDataStore, null, 2);
        downloadFile(content, "application/json", fileName + ".json");
    }

    /* CSV */
    else if (format === "csv") {
        let rows = [];
        for (let section in exifDataStore) {
            rows.push(`"${section.toUpperCase()}"`);
            for (let key in exifDataStore[section]) {
                rows.push(`"${key}","${exifDataStore[section][key]}"`);
            }
            rows.push("");
        }
        const content = rows.join("\n");
        downloadFile(content, "text/csv", fileName + ".csv");
    }

    /* XML */
    else if (format === "xml") {
        let content = `<exifData>\n`;
        for (let section in exifDataStore) {
            content += `  <${section}>\n`;
            for (let key in exifDataStore[section]) {
                content += `    <${key.replace(/\s/g, "_")}>${exifDataStore[section][key]}</${key.replace(/\s/g, "_")}>\n`;
            }
            content += `  </${section}>\n`;
        }
        content += `</exifData>`;
        downloadFile(content, "application/xml", fileName + ".xml");
    }

    /* PHP */
    else if (format === "php") {
        const content = "<?php\n$exifData = " + JSON.stringify(exifDataStore, null, 2) + ";\n?>";
        downloadFile(content, "application/x-httpd-php", fileName + ".php");
    }

    /* PDF */
    else if (format === "pdf") {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;

        // Title uses the base file name
        doc.setFontSize(18);
        doc.text(`${baseFileName} - EXIF Data`, 105, y, { align: "center" });
        y += 10;

        doc.setFontSize(12);

        // Basic File Information Table
        const basicRows = Object.entries(exifDataStore.basic).map(([key, value]) => [key, value]);
        doc.autoTable({
            startY: y,
            head: [["Property", "Value"]],
            body: basicRows,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [36, 36, 36] },
        });
        y = doc.lastAutoTable.finalY + 10;

        // Image Properties Table
        const imageRows = Object.entries(exifDataStore.image).map(([key, value]) => [key, value]);
        doc.autoTable({
            startY: y,
            head: [["Property", "Value"]],
            body: imageRows,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [36, 36, 36] },
        });
        y = doc.lastAutoTable.finalY + 10;

        // EXIF Metadata Table
        const exifRows = Object.entries(exifDataStore.exif).map(([key, value]) => [key, value]);
        doc.autoTable({
            startY: y,
            head: [["Property", "Value"]],
            body: exifRows,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [36, 36, 36] },
            didDrawPage: function () {
                const page = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Page ${page}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
            },
        });

        doc.save(fileName + ".pdf");
    }
});

/* EXIF Data Removal Function */
removeBtn.addEventListener("click", function () {
    if (!uploadedImage) {
        alert("You must upload an image!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;

    ctx.drawImage(uploadedImage, 0, 0);

    canvas.toBlob(function (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "clean-image.jpg";
        link.click();
    }, "image/jpeg", 0.95);
});

/* Download Function */
function downloadFile(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}