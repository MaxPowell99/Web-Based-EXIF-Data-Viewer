const imageInput = document.getElementById("imageInput");
const extractButton = document.getElementById("extractButton");
const imagePreview = document.getElementById("imagePreview");
const exifOutput = document.getElementById("exifOutput");
const uploadText = document.getElementById("uploadText");
const fileInfo = document.getElementById("fileInfo");
const uploadStatus = document.getElementById("uploadStatus");
const previewSection = document.querySelector(".preview");
const exifSection = document.querySelector(".exif-data");

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {

        uploadText.textContent = "File ready";
        fileInfo.textContent = file.name;

        uploadStatus.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Ready for EXIF extraction';
    }

});

/* Show preview when button clicked */
extractButton.addEventListener("click", function () {

    const file = imageInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    /* Show the hidden sections */
    previewSection.style.display = "block";
    exifSection.style.display = "block";

    previewSection.scrollIntoView({ behavior: "smooth" });

    const reader = new FileReader();

    reader.onload = function (event) {

        /* Clear previous preview */
        imagePreview.innerHTML = "";

        const img = document.createElement("img");
        img.src = event.target.result;

        imagePreview.appendChild(img);


        /* Extract EXIF metadata */
        EXIF.getData(img, function () {

            const allMetaData = EXIF.getAllTags(this);

            /* If no EXIF exists */
            if (Object.keys(allMetaData).length === 0) {
                exifOutput.innerHTML = "<p>No EXIF data found in this image.</p>";
                return;
            }

            let output = "<table>";

            for (let tag in allMetaData) {
                let value = allMetaData[tag];

                /* Convert objects (GPS etc.) to readable text */
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }

                output += `
                    <tr>
                        <td><strong>${tag}</strong></td>
                        <td>${value}</td>
                    </tr>
                `;
            }
            output += "</table>";
            exifOutput.innerHTML = output;
        });
    };
    reader.readAsDataURL(file);
});