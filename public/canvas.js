window.addEventListener("load", () => {
    const canvas = document.getElementById("canv");
    const ctx = canvas.getContext("2d");

    let canTop = $(".canvas-container").offset().top;
    let drawing = false;

    $(".signature-canvas").mousedown(function (e) {
        drawing = true;
        draw(e);
    });

    $(".signature-canvas").mousemove(function (e) {
        draw(e);
    });

    $(".signature-canvas").mouseup(function () {
        drawing = false;
        ctx.beginPath();
        let dataURL = canvas.toDataURL("image/png");
        console.log("canvas.toDataURl() :", dataURL);
        return dataURL;
    });

    function draw(e) {
        const curHeight = e.clientY - canTop;
        if (!drawing) return;
        ctx.lineCap = "round";
        ctx.lineWidth = 2;

        ctx.lineTo(e.clientX, curHeight);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, curHeight);
    }
});
