let helper = require("../test-helpers.js");

describe('index.html', () => {
    let dom, container;
    beforeEach(() => {
        // Constructing a new JSDOM with this option is the key
        // to getting the code in the script tag to execute.
        // This is indeed dangerous and should only be done with trusted content.
        // https://github.com/jsdom/jsdom#executing-scripts
        [dom, container] = helper.GetContainer();
    });

    it('renders stuff', function () {
        console.log(container);
    });
});