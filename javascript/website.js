document.getElementById("header").style.display = "none";
document.getElementById("section1").style.display = "none";
document.getElementById("section2").style.display = "none";
document.getElementById("section3").style.display = "none";
document.getElementById("footer-bg").style.display = "none";

document.body.style.overflow = "hidden";

function closeStart() 
{
    document.getElementById("start").style.display = "none";
    document.getElementById("header").style.display = "";
    document.getElementById("section1").style.display = "";
    document.getElementById("section2").style.display = "";
    document.getElementById("section3").style.display = "";
    document.getElementById("footer-bg").style.display = "";
    document.body.style.overflow = "";
}