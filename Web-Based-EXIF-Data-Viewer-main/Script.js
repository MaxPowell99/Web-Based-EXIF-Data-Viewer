let exifDataGlobal = {};

const imageInput = document.getElementById("imageInput");
const extractButton = document.getElementById("extractButton");
const output = document.getElementById("exifOutput");
const preview = document.getElementById("imagePreview");

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        preview.innerHTML = '<img src="${event.target.result}" width="300">';
    };
    reader.readAsDataURL(file);
});

extractButton.addEventListener("click", function () {
    const file = imageInput.files[0];
    if (!file) {
        alert("Please upload an image first.");
        return;
    }

    exifDataGlobal.getData(file, function () {
        const data = EXIF.getAllTags(this);
        exifDataGlobal = data;
        output.innerHTML = "";
        for (let tag in data) {
            const p = document.createElement("p");
            p.textContent = tag + ": " + data[tag];
            output.appendChild(p);
        }

    })
})

document.getElementById("exportJSON").addEventListener("click", function () {
    const json = JSON.stringify(exifDataGlobal, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exif-data.json";
    a.click();
});

document.getElementById("exportCSV").addEventListener("click", function () {
    let csv = "Tag,Value\n";
    for (let tag in exifDataGlobal) {
        csv += tag + "," + exifDataGlobal[tag] + "\n";
    }

    const blob = new Blob([csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exif-data.csv";
    a.click(); 
});

document.getElementById("exportPDF").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.text("EXIF Data", 10, y);
    y += 10;
    for (let tag in exifDataGlobal) {
        doc.text(tag + ": " + exifDataGlobal[tag], 10, y);
        y += 8;
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    }
    doc.save("exif-data.pdf");
})