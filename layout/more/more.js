let currentImageIndex = 0;
const images = document.querySelectorAll(".imageWithCaption .slideshow img");
const caption = document.querySelector(".imageWithCaption .caption");
const imageDescriptions = ["描述 LA", "描述 Boston", "描述 Chicago", "描述沈阳"]; // 依次添加更多描述

function changeImage() {
  images[currentImageIndex].style.display = "none"; // 隐藏当前图片
  currentImageIndex = (currentImageIndex + 1) % images.length; // 计算下一张图片的索引
  images[currentImageIndex].style.display = "block"; // 显示下一张图片
  caption.textContent = imageDescriptions[currentImageIndex]; // 更新描述
}

// 设置间隔时间（例如，5000 毫秒表示 5 秒）
setInterval(changeImage, 5000);
