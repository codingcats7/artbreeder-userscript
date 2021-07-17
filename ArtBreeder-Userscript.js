// ==UserScript==
// @name         Art Breeder UI Edits
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Art Breeder UI Edits, July 2021
// @author       codingcats
// @include      *artbreeder.com*
// ==/UserScript==

(function () {
    "use strict";

    let myUsername = "codingcats7" //replace with your own username (case-sensitive)
    let waitToRunCode = 1000; //in milliseconds, to wait for page to load before script can edit it
    let geneContainerColor = "#B0C4DE" // lightsteelblue. helps see which gene controllers have been changed
    let sliderBackgroundColor = "#4682B4" // steelblue. helps see which sliders have been changed

    let inputNumberStep = 0.005; //default is 0.1
    let childrenMutationSliderRange = [0, 1] // default is [0,1]
    let xbreed_range = [-1, 2] // default is [0,1]
    let geneSliderRange = [-3, 3] //defaults vary by model. note: negative values will break general model
    let additionalSliderRange = 1 //amount to expand slider range by manually

    let fitImageIntoPreview = false; // set to true to zoom/crop images in modals

    // add a gene name to the list below to make it hide when scrolling in gene selection modal
    const genesToHide = [
        'Widen Eye Distance Wip1',
        'Content - Long Hair To Side - 3-4',
        'Sparkly Jewels Wip',
        'Swampy Wip',
        'Negative Facial Hair Gene 8-15',
    ]

    //right click on notifications to re-run edits
    document.querySelector(".notifications").addEventListener("contextmenu", runEdits);

    //add your own CSS below
    const styles = `
        body {
            background: #999999;
        }
    `;

    let styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.body.appendChild(styleElement);

    function runEdits() {

        // Profile Page
        editProfilePage(); // shows New instead of Starred
        // Gene Creation Page
        editGeneCreationPage(); // shows negative image options, adds labels to layer slider
        // Image Page
        editImagePageChildrenTab() // Children tab
        editImagePageCrossbreedTab() // Crossbreed tab - expands content and style sliders
        //Animation Page
        editAnimationPage()

        // Selecting Images
        editSelectImageModalButton() // adds an "Enter" button to submit URL input
        editSelectImageModalStyle() // makes more space / resizes stuff
        // Selecting Genes
        editGenePreviewArrangement(); // makes more compact
        editGeneModalGeneHiding() // hide unwanted genes
        // Gene Containers
        editGeneContainers();

        function editProfilePage() {
            let profileUsername = document.querySelector(".profile_username");
            let newTab = document.querySelector('[data-name="new"]');
            if (profileUsername && profileUsername.innerHTML === myUsername && newTab) {
                newTab.click();
            }
        }

        function editGeneCreationPage() {
            let negImg = document.querySelector("#negative-images");
            if (negImg) {
                negImg.classList.remove("hidden");
            }

            let geneLayerSlider = document.querySelector('#wlatent-slider');
            if (geneLayerSlider) {
                let sliderThumbs = geneLayerSlider.querySelectorAll('.noUi-handle');
                geneLayerSlider.addEventListener('mousemove', () => {
                    [...sliderThumbs].forEach((sliderThumb) => {
                        sliderThumb.innerHTML = Math.round(sliderThumb.ariaValueNow)
                    })
                })
            }
        }

        function editImagePageChildrenTab() {
            let childrenMutationSlider = document.querySelector(".mutation_amount input");
            if (childrenMutationSlider) {
                makeSliderEdit(childrenMutationSlider, childrenMutationSliderRange)
                enableInputTypeToggle(childrenMutationSlider, childrenMutationSliderRange)
                enableExpandSliderRange(childrenMutationSlider)
            }
        }

        function editImagePageCrossbreedTab() {
            let xbreedSliders = document.querySelectorAll("#mix_slider input");
            [...xbreedSliders].forEach((slider) => {
                makeSliderEdit(slider, xbreed_range)
                enableInputTypeToggle(slider, xbreed_range);
                enableExpandSliderRange(slider)
            });
        }

        function editAnimationPage() {
            if (!document.URL.includes("video")) {
                return
            }
            const styles = `
                #preview .images img{
                    width: 50vh;
                    max-width: 60vw;
                    height: auto;
                }
                .flex_column {
                    padding: 0;
                }
                .flex_row {
                    flex-wrap: nowrap;
                }
                #timeline_container {
                    margin-top: 10px;
                    position: absolute;
                }
               
            `;

            let styleElement = document.createElement('style');
            styleElement.innerHTML = styles;
            document.body.appendChild(styleElement);


        }

        function editSelectImageModalButton() {
            let addImageUrlForm = document.querySelector("#add_image_url");
            if (addImageUrlForm && !addImageUrlForm.querySelector('button')) {
                const submitFormBtn = document.createElement("button");
                submitFormBtn.innerHTML = "Enter"
                submitFormBtn.type = "submit"
                addImageUrlForm.insertAdjacentElement("beforeend", submitFormBtn)
            }
        }

        function editSelectImageModalStyle() {
            let selectImageModal = document.querySelector("#select_image_modal")
            if (selectImageModal) {

                let modalContent = selectImageModal.querySelector('.modal-content')
                modalContent.style.height = "96vh";
                modalContent.style.display = "flex"
                modalContent.style.flexDirection = "column"

                let modalHeader = selectImageModal.querySelector('.modal-header')
                modalHeader.querySelector(".inactive_text").style.display = "none"
                modalHeader.querySelector('h3').style.margin = "0"

                let modalBody = selectImageModal.querySelector('.modal-body')
                modalBody.style.height = "92vh";
                modalBody.style.display = "flex"
                modalBody.style.flexDirection = "column"
                modalBody.querySelector('.tab_names').style.flexShrink = 0;
                modalBody.querySelector('.images_container').style.maxHeight = 'none';

                if (!fitImageIntoPreview) {
                    const imageSelectStyles = `
                        .main_image {
                            background-size: contain !important;
                        }
                    `;

                    let styleElement = document.createElement('style');
                    styleElement.innerHTML = imageSelectStyles;
                    document.body.appendChild(styleElement);
                }

            }
        }

        function editGeneContainers() {
            let geneControllers = document.querySelectorAll(".gene_controller");
            [...geneControllers].forEach((geneController) => {

                geneController.style.backgroundColor = geneContainerColor;

                let inputRowEle = geneController.querySelector(".gene_input_row");
                let sliderEle = geneController.querySelector(".slider input");
                let inputEle = inputRowEle.querySelector("input")

                //expand range and enable slider/number toggle
                makeSliderEdit(sliderEle, geneSliderRange)
                makeInputNumEdit(inputEle)
                enableExpandSliderRange(sliderEle)

            });
        }

        function editGenePreviewArrangement() {
            const geneStyles = `
            .gene-preview-container,.usergene-container { 
                display:flex !important; 
                flex-wrap: wrap; 
                justify-content: space-between;
                max-width: none !important;
            }
            .usergene {
                width:49%; 
                margin: 4px 3px;
            }
            .usergene .usergene-info-row {
                width: auto;
            }
            .usergene .usergene-info-row * {
                margin:0; 
            }
            `;

            let styleElement = document.createElement('style');
            styleElement.innerHTML = geneStyles;
            document.body.appendChild(styleElement);
        }

        function editGeneModalGeneHiding() {
            const genesToHideClean = genesToHide.map((gene) => gene.toLowerCase().trim())
            let geneModal = document.querySelector('#select_gene_modal')
            if (geneModal) {
                let modalBody = geneModal.querySelector('.modal-body')
                if (modalBody.getAttribute('edits-listener') !== 'true') {
                    modalBody.setAttribute('edits-listener', 'true');
                    modalBody.addEventListener('scroll', () => hideGenes(genesToHideClean))
                }
            }

            function hideGenes(unwantedGenes) {
                let usergenePreviews = document.querySelectorAll(".usergene");
                if (usergenePreviews) {
                    [...usergenePreviews].forEach((usergenePreview) => {
                        let usergeneName = usergenePreview.dataset.gene_name
                        let hideGene = unwantedGenes.includes(usergeneName)
                        if (hideGene) {
                            usergenePreview.style.display = 'none';
                        }
                    });
                }

            }
        }

        function enableInputTypeToggle(ele, range) {
            ele.oncontextmenu = (event) => {
                event.target.type === "range"
                    ? makeInputNumEdit(ele)
                    : makeSliderEdit(ele, range);
            };
        }

        function enableExpandSliderRange(ele, additionalRange = additionalSliderRange) {
            ele.ondblclick = (event) => {
                ele = event.target
                ele.min = parseInt(ele.min) - additionalRange;
                ele.max = parseInt(ele.max) + additionalRange;
            };
        }

        function makeSliderEdit(ele, range) {
            ele.type = "range";
            ele.step = "any";
            ele.min = Math.min(range[0], ele.value);
            ele.max = Math.max(range[1], ele.value);
            ele.style.height = "6px";
            ele.style.maxWidth = "90%";
            ele.style.backgroundColor = sliderBackgroundColor;
        }

        function makeInputNumEdit(ele) {
            ele.type = "number";
            ele.step = inputNumberStep;
            ele.min = -1000;
            ele.max = 1000;
            ele.style.height = "20px";
            ele.style.maxWidth = "120px";
            ele.style.backgroundColor = '#d3d3d3';
        }
    }

    window.setTimeout(runEdits, waitToRunCode);


})();

