const { Map } = require("immutable");
const util = require("util");
const res_format = Map({
  status: "",
  message: "",
  body: Map({})
});

/**
 * Google Cloud Vision integration
 */
const vision = require("@google-cloud/vision");
// Creates a client
const client = new vision.ImageAnnotatorClient();

exports.vision_serverless = function(req, res) {
    if (req.method === "POST") {
      let imageBuffer = Buffer.from(req.body.base64Image, "base64");
      vision_text_detection(imageBuffer)
        .then(result => {
          res.status(200).send(response_ingredients_text({'text':result[0]['fullTextAnnotation']['text']}));
        })
        .catch(err => {
          res.status(200).send(response_error(err));
        });
    } else {
      res.status(200).send(response_method_not_allowed());
    }
  };
  

  
  function response_ingredients_text(body = {}) {
    return create_resp("SUCCESSFUL", "Text fetched successfully.", body);
  }
  
  function response_method_not_allowed() {
    return create_resp("FAIL", "HTTP Method not allowed", {});
  }
  
  function response_error(err) {
    return create_resp("FAIL", err, err);
  }
  
  function create_resp(status, message, body) {
    let res = res_format.set("status", status);
    res = res.set("message", message);
    res = res.set("body", Map(body));
    return res.toJS();
  }

  function vision_text_detection(imageBuffer) {
    return new Promise((resolve, reject) => {
      client
        .textDetection({
          image: { content: imageBuffer }
        })
        .then(response => {
          console.log(response);
          resolve(response);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  