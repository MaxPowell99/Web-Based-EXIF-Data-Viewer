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

        imagePreview.innerHTML = "";

        const img = document.createElement("img");
        img.src = event.target.result;

        imagePreview.appendChild(img);
    };

    reader.readAsDataURL(file);
});