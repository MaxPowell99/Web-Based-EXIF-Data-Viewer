const imageInput = document.getElementById("imageInput");
const extractButton = document.getElementById("extractButton");
const imagePreview = document.getElementById("imagePreview");
const exifOutput = document.getElementById("exifOutput");
const uploadText = document.getElementById("uploadText");
const fileInfo = document.getElementById("fileInfo");
const uploadStatus = document.getElementById("uploadStatus");
const previewSection = document.querySelector(".preview");
const exifSection = document.querySelector(".exif-data");
const uploadBox = document.querySelector(".upload-box");

function showError(message) {
    uploadText.textContent = "Invalid File Type - Click again to try another file.";
    fileInfo.textContent = message;

    uploadStatus.innerHTML =
        '<i class="fa-solid fa-circle-xmark"></i> Upload Failed';
    
    uploadStatus.classList.add("error");
    uploadStatus.classList.remove("success");

    uploadBox.classList.add("error");
    uploadBox.classList.remove("success");

    imageInput.value = ""; // reset file input
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

    uploadStatus.innerHTML =
        '<i class="fa-solid fa-circle-check"></i> Ready for EXIF extraction';
    
    uploadStatus.classList.add("success");
    uploadStatus.classList.remove("error");
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

    previewSection.scrollIntoView({ behavior: "smooth" });

    const reader = new FileReader();

    reader.onload = function (event) {

        /* Clear previous preview */
        imagePreview.innerHTML = "";
        exifOutput.innerHTML = "";

        const img = document.createElement("img");
        img.src = event.target.result;

        imagePreview.appendChild(img);

        /* Wait for image to load */
        img.onload = function () {

            /* BASIC FILE INFO */
            const basicInfo = `
                <h3>Basic File Information</h3>
                <table class="exif-table">
                    <tr><th>Property</th><th>Value</th></tr>
                    <tr><td>File Name</td><td>${file.name}</td></tr>
                    <tr><td>File Size</td><td>${(file.size / 1024).toFixed(2)} KB</td></tr>
                    <tr><td>File Type</td><td>${file.type}</td></tr>
                    <tr><td>Date Last Modified</td><td>${new Date(file.lastModified).toLocaleString()}</td></tr>
            `;

            /* IMAGE PROPERTIES */
            const imageProps = `
                <h3>Image Properties</h3>
                <table class="exif-table">
                    <tr><th>Property</th><th>Value</th></tr>
                    <tr><td>Width</td><td>${img.naturalWidth} px</td></tr>
                    <tr><td>Height</td><td>${img.naturalHeight} px</td></tr>
                </table>
            `;

            /* EXIF DATA */
            EXIF.getData(img, function () {

                const make = EXIF.getTag(this, "Make");
                const model = EXIF.getTag(this, "Model");
                const dateTaken = EXIF.getTag(this, "DateTimeOriginal");
                const exposure = EXIF.getTag(this, "ExposureTime");
                const iso = EXIF.getTag(this, "ISOSpeedRatings");
                const aperture = EXIF.getTag(this, "FNumber");
                const focalLength = EXIF.getTag(this, "FocalLength");
                const software = EXIF.getTag(this, "Software");

                let gps = "Not available";

                const lat = EXIF.getTag(this, "GPSLatitude");
                const lon = EXIF.getTag(this, "GPSLongitude");

                if (lat && lon) {
                    gps = lat.join(", ") + " / " + lon.join(", ");
                }

                let exifSection = `<h3>EXIF Metadata</h3>`;

                /* If no EXIF data*/
                if (!make && !model && !dateTaken) {
                    exifSection += `<p>No EXIF data found.</p>`;
                } else {
                    exifSection += `
                        <table class="exif-table">
                            <tr><th>Property</th><th>Value</th></tr>
                            <tr><td>Camera Make</td><td>${make || "N/A"}</td></tr>
                            <tr><td>Camera Model</td><td>${model || "N/A"}</td></tr>
                            <tr><td>Date Taken</td><td>${dateTaken || "N/A"}</td></tr>
                            <tr><td>Exposure Time</td><td>${exposure || "N/A"}</td></tr>
                            <tr><td>ISO</td><td>${iso || "N/A"}</td></tr>
                            <tr><td>Aperture</td><td>${aperture || "N/A"}</td></tr>
                            <tr><td>Focal Length</td><td>${focalLength || "N/A"}</td></tr>
                            <tr><td>GPS Location</td><td>${gps}</td></tr>
                            <tr><td>Software</td><td>${software || "N/A"}</td></tr>
                        </table>
                    `;
                }

                /* FINAL OUTPUT */
                exifOutput.innerHTML =
                    basicInfo +
                    imageProps +
                    exifSection;
            });
        };
    };

    reader.readAsDataURL(file);
});