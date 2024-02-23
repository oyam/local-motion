![Architecture](../assets/architecture.png)

## Flow of Local Motion

(1) Client triggers the pre-motion and move the mouse cursor around the target object to where you want the mouse cursor to actually move. Pre-motion can be mouse controle applications such as [Talon Voice](https://talonvoice.com/) with [Tobii Eye Traker 5](https://gaming.tobii.com/product/eye-tracker-5/). For examples of pre-motions, please check out [local-motion-examples/pre-motions](https://github.com/oyam/local-motion-examples/tree/main/pre-motions).

(2) Pre-motion triggers Local Motion by simulating keyboard input events.

(2)′ Otherwise, the client triggers Local Motion using the shortcut key.

(3) The global shortcut handler takes a screenshot, crops the area around the mouse cursor to a preset window size, and calls the Default Detector with that image as input.

(3)′ The global shortcut handler takes a screenshot, crops the area around the mouse cursor to a preset window size, and calls the Custom Detector with a Base64-encoded image via HTTP.

(4) The Default Detector detects icons and text in an image and outputs the bounding boxes.

(4)′ The Custom Detector returns bounding boxes via HTTP. Detecting objects is not always necessary; the only requirement is that the Custom Detector has a POST method to accept the image and return the bounding boxes. For examples of Custom Detectors, see [local-motion-examples/custom-detectors](https://github.com/oyam/local-motion-examples/tree/main/custom-detectors).

(5) The rendering component displays motion suggestions based on the returned bounding boxes. Local Motion concentrates on the local window area around the current mouse cursor position and can theoretically be applied to any application. You can also choose where in the box the suggestions are displayed, such as in the center and top-left of each box.

(6) The client selects one of the suggestions to move the mouse cursor.

(7) The global shortcut handler sends the coordinates of the mouse cursor to move

(8) The mouse controller moves the mouse cursor to the specified coordinates and performs a post-action. Post-action choices include: None, Left Click, Double Left Click, Right Click, Middle Click.
