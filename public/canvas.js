window.addEventListener("load", () => {
    const canvas = document.getElementById("canv");
    const ctx = canvas.getContext("2d");
    let dataURL;
    const signature = $("input[name='signature']").eq(0);

    let drawing = false;

    $(".signature-canvas").mousedown(function (e) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        draw(e);
    });

    $(".signature-canvas").mousemove(function (e) {
        draw(e);
    });

    $(".signature-canvas").mouseup(function () {
        drawing = false;
        ctx.closePath();
        ctx.beginPath();
        dataURL = canvas.toDataURL("image/png");
        signature.val(dataURL);
    });

    function draw(e) {
        if (!drawing) return;
        ctx.lineCap = "round";
        ctx.lineWidth = 2;

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});
