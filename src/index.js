import * as deepar from 'deepar';

// Log the version. Just in case.
console.log("Deepar version: " + deepar.version);

// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediatly.
(async function() {

  // Resize the canvas according to screen size.
  const canvas = document.getElementById('deepar-canvas');
  canvas.width = window.innerWidth > window.innerHeight ? Math.floor(window.innerHeight * 0.66) : window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Initialize DeepAR.
  const deepAR = await deepar.initialize({
    licenseKey: '6e12a079bdd30322595e15dd2f174a3ce1da98b47244df092d2b67d59a9ba5922b14e03864d3d6f5',
    canvas: canvas,
    rootPath: "./deepar-resources", // See webpack.config.js and package.json build script.
    additionalOptions: {
      // Disable the default webcam preview.
      cameraConfig: {
        disableDefaultCamera: true
      },
      hint: "faceModelsPredownload" // Download the face tracking model as soon as possible.
    }
  });

  deepAR.setPaused(true);

  // Hide the loading screen.
  document.getElementById("loader-wrapper").style.display = "none";

  // Nice util function for loading an image.
  async function getImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {resolve(img)};
      img.onerror = reject;
      img.src = src;
    })
  }

  // Using setTimeout with await.
  async function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  // Function for changing the photo.
  async function processPhoto(src) {
    let image;
    if(typeof src == "string") {
      image = await getImage(src);
    } else {
      image = src;
    }

    // Process image multiple times to get more accurate tracking results.
    // Face tracking gets better with successive frames.
    deepAR.processImage(image);
    deepAR.processImage(image);
    deepAR.processImage(image);

    return image;
  }

  // Initial image
  let image = await getImage('./test_photos/Anon2564.jpg');

  // Trigger the face tracking initialization by loading the effect.
  deepAR.switchEffect('./effects/look1').then(() => {
    // Clear the effect after it has been loaded.
    deepAR.clearEffect()
    // Push the current image frame because clearEffect can sometimes produce a black image when setPaused is called.
    deepAR.processImage(image);
  }).catch(() => {
    // The switchEffectCanceled error will be thrown if we try to load some beuty effect while this promise is not resolved.
    // So we just ignore this error.
  });

  // Load the inital photo.
  image = await processPhoto(image);

  document.getElementById('load-one-image').onclick = async function() {
    image = await processPhoto('./test_photos/Anon2564.jpg');
  }
  document.getElementById('run-10-images').onclick = async function() {
    image = await processPhoto('./test_photos/Anon2564.jpg');
    await delay(33);

    const imageFolder = '/home/jlathrop/Documents/photoedit-Beauty-web-js/public/test_photos/';
    const imageFiles = ['Anon2564.jpg', 'Anon2630.jpg', 'Anon2642.jpg']; // Add more image file names as needed

    for (const file of imageFiles) {
      image = await processPhoto(imageFolder + file);
      await delay(33);
      // Add your code here to process the image
      deepAR.switchEffect('./effects/DeepAR_Beauty.deepar');
      await delay(33);
      await processPhoto(image);
      
      const screenshot = await deepAR.takeScreenshot();
      const a = document.createElement('a');
      a.href = screenshot;
      a.download = 'photo.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }


  // document.getElementById('reset').onclick = async function() {
  //   //how to switch effect
  //   // deepAR.switchEffect('./effects/look1');
  //   // await delay(33);
  //   // await processPhoto(image);

  //   //TODO: reset enviorment
  //   deepAR.clearEffect();
  //   deepAR.processImage(image);
  // }


  document.getElementById('apply-makeup-look').onclick = async function() {
    deepAR.switchEffect('./effects/DeepAR_Beauty.deepar');
    await delay(33);
    await processPhoto(image);
  }

  document.getElementById('apply-makeup-look-extreme').onclick = async function() {
    deepAR.switchEffect('./effects/makupDeepAR');
    await delay(33);
    await processPhoto(image);
    await processPhoto(image);
    await processPhoto(image);
  }

  document.getElementById('remove-makeup-filter').onclick = function() {
    deepAR.clearEffect();
    deepAR.processImage(image);
  }
  document.getElementById('download-photo').onclick = async function() {
    const screenshot = await deepAR.takeScreenshot();
    const a = document.createElement('a');
    a.href = screenshot;
    a.download = 'photo.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
})();
