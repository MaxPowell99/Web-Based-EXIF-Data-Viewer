const uploadBox = document.querySelector(".upload-box");
const uploadText = document.getElementById("uploadText");
const uploadStatus = document.getElementById("uploadStatus");
const extractButton = document.getElementById("extractButton");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
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
    uploadText.style.display = "none"; // hide default text

    uploadStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Upload Failed';
    uploadStatus.className = "error";

    fileName.textContent = ""; // no filename on error

    uploadExtra.textContent = "Invalid File Type - Click again to try another file.";

    fileInfo.textContent = message;

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

    if (fileName.endsWith(".png")) {
        showError("PNG files are not supported - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

     if (fileName.endsWith(".heic")) {
        showError("HEIC files are not supported - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

    if (fileName.endsWith(".gif")) {
        showError("GIF files are not supported - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

    if (fileName.endsWith(".webp")) {
        showError("WEBP files are not supported - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

    if (fileName.endsWith(".tif")) {
        showError("TIF files are not supported - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

    if (!isJPG) {
        showError("Unsupported file type - Only .jpg / .jpeg files can be uploaded.");
        return;
    }

    uploadBox.classList.remove("error");
    uploadBox.classList.add("success");

    uploadText.style.display = "none"; // hide initial text
    uploadStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Upload Complete';
    uploadStatus.className = "success";
    fileInfo.textContent = file.name;

    uploadStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Upload Complete - Click the extract button to see EXIF data';
    
    uploadStatus.classList.add("success");
    uploadStatus.classList.remove("error");

    uploadExtra.textContent = "Click again to upload another file.";

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

                /* Camera Info */
                const cameraInfoData = {
                    "Camera Make": EXIF.getTag(this, "Make") || "N/A",
                    "Camera Model": EXIF.getTag(this, "Model") || "N/A",
                    "Lens Model": EXIF.getTag(this, "LensModel") || "N/A",
                    "Date & Time Taken": EXIF.getTag(this, "DateTimeOriginal") || "N/A",
                    "Software Modified With": EXIF.getTag(this, "Software") || "N/A",
                    "Date Last Modified": new Date(file.lastModified).toLocaleString()
                };

                /* Capture Settings */
                const captureSettingsData = {
                    "ISO": EXIF.getTag(this, "ISOSpeedRatings") || "N/A",
                    "Exposure Time": EXIF.getTag(this, "ExposureTime") || "N/A",
                    "Aperture": EXIF.getTag(this, "FNumber") || "N/A",
                    "Focal Length": EXIF.getTag(this, "FocalLength") || "N/A",
                    "Flash": EXIF.getTag(this, "Flash") !== undefined ? (EXIF.getTag(this, "Flash") ? "Yes" : "No") : "N/A",
                    "White Balance": EXIF.getTag(this, "WhiteBalance") !== undefined ? (EXIF.getTag(this, "WhiteBalance") === 1 ? "Auto" : "Manual") : "N/A",
                    "Metering Mode": EXIF.getTag(this, "MeteringMode") || "N/A"
                };

                /* GPS Info */
                let lat = EXIF.getTag(this, "GPSLatitude");
                let lon = EXIF.getTag(this, "GPSLongitude");
                let gpsAltitude = EXIF.getTag(this, "GPSAltitude");
                let gpsTimestamp = EXIF.getTag(this, "GPSTimeStamp");

                let gpsLocation = "Not available";
                if (lat && lon) {
                    gpsLocation = lat.join(", ") + " / " + lon.join(", ");
                }

                gpsAltitude = gpsAltitude ? gpsAltitude + " m" : "Not available";
                gpsTimestamp = gpsTimestamp ? gpsTimestamp.join(":") : "Not available";

                const gpsInfoData = {
                    "GPS Location": gpsLocation,
                    "GPS Altitude": gpsAltitude,
                    "GPS Timestamp": gpsTimestamp
                };

                /* Store data for export */
                exifDataStore = {
                    basic: basicInfoData,
                    image: imagePropsData,
                    camera: cameraInfoData,
                    capture: captureSettingsData,
                    gps: gpsInfoData
                };

                let exifDataSection = `<div class="exif-section"><h3>EXIF Metadata</h3>`;

                function createSubsection(title, data) {
                    return `
                        <tr style="background:#f0f0f0;"><th colspan="2" style="text-align:center;">${title}</th></tr>
                        ${Object.entries(data).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
                    `;
                }

                exifDataSection += `
                <table class="exif-table">
                <colgroup>
                <col style="width:30%">
                <col style="width:70%">
                </colgroup>
                `;
                
                exifDataSection += createSubsection("Camera Info", cameraInfoData);
                exifDataSection += createSubsection("Capture Settings", captureSettingsData);
                exifDataSection += createSubsection("GPS Information", gpsInfoData);
                exifDataSection += `</table></div>`;

                /* FINAL OUTPUT */
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
    const baseFileName = originalFileName.replace(/\.[^/.]+$/, ""); /* Removes .jpg, .jpeg, etc. from file name */
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

            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: "auto" }
            }
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

            columnStyles: {
                0: { cellWidth: 55 },
                1: { cellWidth: "auto" }
            }
        });
        y = doc.lastAutoTable.finalY + 10;

        // EXIF Metadata Table
        const sections = ["camera", "capture", "gps"];
        sections.forEach(section => {
            const rows = Object.entries(exifDataStore[section]).map(([key, value]) => [key, value]);
            doc.autoTable({
                startY: y,
                head: [["Property", "Value"]],
                body: rows,
                theme: "grid",
                styles: { fontSize: 10 },
                headStyles: { fillColor: [36, 36, 36] },

                columnStyles: {
                    0: { cellWidth: 55 },
                    1: { cellWidth: "auto" }
                }
            });
            y = doc.lastAutoTable.finalY + 10;
        });

        // Page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
        }

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

        const originalName = imageInput.files[0].name;
        const extension = originalName.split('.').pop();
        const baseName = originalName.replace(/\.[^/.]+$/, "");

        link.download = "clean-" + baseName + "." + extension;

        link.click();
    },  "image/jpeg", 0.95);
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