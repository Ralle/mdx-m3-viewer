import JassAgent from './agent';

export default class JassGroup extends JassAgent {
    constructor(jassContext) {
        super(jassContext);

        this.units = new Set();
    }
};
