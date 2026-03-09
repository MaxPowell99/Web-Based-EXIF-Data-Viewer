const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", function () {

        imagePreview.innerHTML = "";

        const img = document.createElement("img");
        img.src = reader.result;

        imagePreview.appendChild(img);
    });

    reader.readAsDataURL(file);
});