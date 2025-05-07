// Rules.js - Wrapper around the original rules.js functionality
// This provides a compatibility layer between the new settings system and the original game rules

// Define lesson types to match the original LESSIONTYPE
const LESSIONTYPE = {
    MULTIPLY_TABLE: 0,
    MULTIPLY_RANDOM: 1,
    ADDITION_RANDOM: 2,
    SUBSTRACTION_RANDOM: 3
};

// Task class to match the original
class Task {
    constructor() {
        this.text = '';
        this.result = null;
    }
}

// Rule class to match the original
class Rule {
    constructor() {
        this.numMonsters = 0;
        this.speed = 0;
    }
}

// Helper function for random integer generation
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main Rules class that wraps the original Rules class functionality
export default class Rules {
    constructor() {
        this.speedMin = 20;
        this.speedStartDelay = 60000; // 60 seconds
        this.speedInc = 10;
        this.speedEvery = 20000; // 20 seconds
        this.speedMax = 50;

        this.monstersToUse = ['monster1', 'monster2'];
        this.monstersMin = 1;
        this.monstersStartDelay = 0;
        this.monstersInc = 1;
        this.monstersEvery = 60000; // 60 seconds
        this.monstersMax = 5;

        this.lessionType = LESSIONTYPE.ADDITION_RANDOM;
        this.lessionMultiplyTable = 9;
        this.lessionMinValue = 10;
        this.lessionMaxValue = 20;
        this.lessionAllowNegativeResult = false;

        // Variables for running game rules
        this.gameTime = 0;
        this.nextMonsterIncTime = 0;
        this.maxMonsterDone = false;
        this.numMonsterAlive = 0;

        this.nextSpeedIncTime = 0;
        this.maxSpeedDone = false;
        this.actualSpeed = 0;
    }

    // Load rules from XML
    LoadRules(xmlurl) {
        try {
            const rulesXmlhttp = new XMLHttpRequest();
            console.log('Loading rules from:', xmlurl);
            rulesXmlhttp.open('GET', xmlurl, false);
            rulesXmlhttp.send();
            const ruleXmlDoc = rulesXmlhttp.responseXML;

            if (!ruleXmlDoc) {
                console.error('Failed to parse XML rules');
                return false;
            }

            // Parse speed settings
            const speedNodes = ruleXmlDoc.evaluate('/rules/speed', ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (speedNodes.snapshotLength !== 1) return false;

            const speedNode = speedNodes.snapshotItem(0);
            this.speedMin = parseInt(speedNode.getAttribute('min'));
            this.speedStartDelay = parseInt(speedNode.getAttribute('startdelay'));
            this.speedInc = parseInt(speedNode.getAttribute('increment'));
            this.speedEvery = parseInt(speedNode.getAttribute('every'));
            this.speedMax = parseInt(speedNode.getAttribute('max'));

            // Parse monster settings
            const monsterNodes = ruleXmlDoc.evaluate('/rules/monsters', ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (monsterNodes.snapshotLength !== 1) return false;

            const monsterNode = monsterNodes.snapshotItem(0);
            eval('var tmp=' + monsterNode.getAttribute('list') + ';');
            this.monstersToUse = tmp;
            this.monstersMin = parseInt(monsterNode.getAttribute('min'));
            this.monstersStartDelay = parseInt(monsterNode.getAttribute('startdelay'));
            this.monstersInc = parseInt(monsterNode.getAttribute('increment'));
            this.monstersEvery = parseInt(monsterNode.getAttribute('every'));
            this.monstersMax = parseInt(monsterNode.getAttribute('max'));

            // Parse lesson settings
            const lessionNodes = ruleXmlDoc.evaluate('/rules/lession', ruleXmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (lessionNodes.snapshotLength !== 1) return false;

            const lessionNode = lessionNodes.snapshotItem(0);
            const tmpType = lessionNode.getAttribute('type').toLowerCase();

            switch (tmpType) {
                case 'multiply_table':
                    this.lessionType = LESSIONTYPE.MULTIPLY_TABLE;
                    this.lessionMultiplyTable = parseInt(lessionNode.getAttribute('table'));
                    break;
                case 'multiply_random':
                    this.lessionType = LESSIONTYPE.MULTIPLY_RANDOM;
                    this.lessionMinValue = parseInt(lessionNode.getAttribute('min'));
                    this.lessionMaxValue = parseInt(lessionNode.getAttribute('max'));
                    break;
                case 'addition_random':
                    this.lessionType = LESSIONTYPE.ADDITION_RANDOM;
                    this.lessionMinValue = parseInt(lessionNode.getAttribute('min'));
                    this.lessionMaxValue = parseInt(lessionNode.getAttribute('max'));
                    break;
                case 'substraction_random':
                    this.lessionType = LESSIONTYPE.SUBSTRACTION_RANDOM;
                    this.lessionMinValue = parseInt(lessionNode.getAttribute('min'));
                    this.lessionMaxValue = parseInt(lessionNode.getAttribute('max'));
                    const tmpval = lessionNode.getAttribute('allownegativeresult').toLowerCase();
                    this.lessionAllowNegativeResult = tmpval === 'true';
                    break;
            }
            return true;
        } catch (error) {
            console.error('Error loading rules:', error);
            return false;
        }
    }

    GetRandomMonsterName() {
        const numMonsters = this.monstersToUse.length;
        const i = getRandomInt(0, numMonsters - 1);
        return this.monstersToUse[i];
    }

    GetNextTask_MultiplyTable() {
        const param = getRandomInt(0, 10);
        const task = new Task();
        task.text = this.lessionMultiplyTable + ' × ' + param;
        task.result = this.lessionMultiplyTable * param;
        return task;
    }

    GetNextTask_MultiplyRandom() {
        const param1 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        const param2 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        const task = new Task();
        task.text = param1 + ' × ' + param2;
        task.result = param1 * param2;
        return task;
    }

    GetNextTask_AdditionRandom() {
        const param1 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        const param2 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        const task = new Task();
        task.text = param1 + ' + ' + param2;
        task.result = param1 + param2;
        return task;
    }

    GetNextTask_SubstractionRandom() {
        const param1 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        let param2 = 0;

        if (this.lessionAllowNegativeResult) {
            param2 = getRandomInt(this.lessionMinValue, this.lessionMaxValue);
        } else {
            param2 = getRandomInt(this.lessionMinValue, param1);
        }

        const task = new Task();
        task.text = param1 + ' - ' + param2;
        task.result = param1 - param2;
        return task;
    }

    GetNextTask() {
        switch (this.lessionType) {
            case LESSIONTYPE.MULTIPLY_TABLE:
                return this.GetNextTask_MultiplyTable();
            case LESSIONTYPE.MULTIPLY_RANDOM:
                return this.GetNextTask_MultiplyRandom();
            case LESSIONTYPE.ADDITION_RANDOM:
                return this.GetNextTask_AdditionRandom();
            case LESSIONTYPE.SUBSTRACTION_RANDOM:
                return this.GetNextTask_SubstractionRandom();
            default:
                return this.GetNextTask_AdditionRandom();
        }
    }

    Reset() {
        this.gameTime = 0;

        if (this.monstersStartDelay !== 0) {
            this.nextMonsterIncTime = this.monstersStartDelay;
        } else {
            this.nextMonsterIncTime = this.monstersEvery;
        }

        this.numMonsterAlive = this.monstersMin;
        this.maxMonsterDone = this.numMonsterAlive >= this.monstersMax;

        if (this.speedStartDelay !== 0) {
            this.nextSpeedIncTime = this.speedStartDelay;
        } else {
            this.nextSpeedIncTime = this.speedEvery;
        }

        this.actualSpeed = this.speedMin;
        this.maxSpeedDone = this.actualSpeed >= this.speedMax;
    }

    QueryRules(dt) {
        this.gameTime += dt;

        // Test if it's time to evaluate next monster increase
        if (!this.maxMonsterDone && this.gameTime >= this.nextMonsterIncTime) {
            this.nextMonsterIncTime += this.monstersEvery;
            this.numMonsterAlive += this.monstersInc;
            this.maxMonsterDone = this.numMonsterAlive >= this.monstersMax;
        }

        // Test speed
        if (!this.maxSpeedDone && this.gameTime >= this.nextSpeedIncTime) {
            this.nextSpeedIncTime += this.speedEvery;
            this.actualSpeed += this.speedInc;
            this.maxSpeedDone = this.actualSpeed >= this.speedMax;
        }

        const r = new Rule();
        r.numMonsters = this.numMonsterAlive;
        r.speed = this.actualSpeed;
        return r;
    }
} 