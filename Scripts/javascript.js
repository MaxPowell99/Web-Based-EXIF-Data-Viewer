const imageInput = document.getElementById("imageInput");
const extractButton = document.getElementById("extractButton");
const imagePreview = document.getElementById("imagePreview");
const exifOutput = document.getElementById("exifOutput");
const uploadText = document.getElementById("uploadText");
const fileInfo = document.getElementById("fileInfo");
const uploadStatus = document.getElementById("uploadStatus");
const previewSection = document.querySelector(".preview");
const exifSection = document.querySelector(".exif-data");

/* When user selects a file */
imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        uploadText.textContent = "File ready";
        fileInfo.textContent = file.name;

        uploadStatus.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Ready for EXIF extraction';
    }

});

/* When user clicks extract button */
extractButton.addEventListener("click", function () {

    const file = imageInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    /* Show hidden sections */
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

            /* -------------------- */
            /* BASIC FILE INFO */
            /* -------------------- */
            const basicInfo = `
                <h3>Basic File Information</h3>
                <p><strong>File Name:</strong> ${file.name}</p>
                <p><strong>File Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                <p><strong>File Type:</strong> ${file.type}</p>
                <p><strong>Date Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
            `;

            /* -------------------- */
            /* IMAGE PROPERTIES */
            /* -------------------- */
            const imageProps = `
                <h3>Image Properties</h3>
                <p><strong>Width:</strong> ${img.naturalWidth} px</p>
                <p><strong>Height:</strong> ${img.naturalHeight} px</p>
            `;

            /* -------------------- */
            /* EXIF DATA */
            /* -------------------- */
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

                /* If no meaningful EXIF */
                if (!make && !model && !dateTaken) {
                    exifSection += `<p>No EXIF data found.</p>`;
                } else {
                    exifSection += `
                        <p><strong>Camera Make:</strong> ${make || "N/A"}</p>
                        <p><strong>Camera Model:</strong> ${model || "N/A"}</p>
                        <p><strong>Date Taken:</strong> ${dateTaken || "N/A"}</p>
                        <p><strong>Exposure Time:</strong> ${exposure || "N/A"}</p>
                        <p><strong>ISO:</strong> ${iso || "N/A"}</p>
                        <p><strong>Aperture:</strong> ${aperture || "N/A"}</p>
                        <p><strong>Focal Length:</strong> ${focalLength || "N/A"}</p>
                        <p><strong>GPS Location:</strong> ${gps}</p>
                        <p><strong>Software:</strong> ${software || "N/A"}</p>
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