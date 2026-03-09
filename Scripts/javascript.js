const imageInput = document.getElementById("imageInput");
const extractButton = document.getElementById("extractButton");
const imagePreview = document.getElementById("imagePreview");

const uploadText = document.getElementById("uploadText");
const fileInfo = document.getElementById("fileInfo");

/* Detect file selection */
imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        uploadText.textContent = "File selected:";
        fileInfo.textContent = file.name;
    }
});

/* Show preview when button clicked */
extractButton.addEventListener("click", function () {

    const file = imageInput.files[0];

    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        imagePreview.innerHTML = "";

        const img = document.createElement("img");
        img.src = event.target.result;

        imagePreview.appendChild(img);
    };

    reader.readAsDataURL(file);
});