const lstmModel = require('./lstmModel');

async function testPrediction() {
    console.log('--- Starting CNN-LSTM Model Verification ---');
    
    // Mock sequence of events
    const mockEvents = [
        { type: 'mouse_move', data: { speed: 1.2 }, timestamp: Date.now() - 1000 },
        { type: 'mouse_move', data: { speed: 1.5 }, timestamp: Date.now() - 900 },
        { type: 'keydown', data: { dwellTime: 80 }, timestamp: Date.now() - 800 },
        { type: 'mouse_move', data: { speed: 0.8 }, timestamp: Date.now() - 700 },
        { type: 'mouse_move', data: { speed: 2.5 }, timestamp: Date.now() - 600 },
        { type: 'click', data: {}, timestamp: Date.now() - 500 },
        { type: 'mouse_move', data: { speed: 1.1 }, timestamp: Date.now() - 400 },
        { type: 'keydown', data: { dwellTime: 95 }, timestamp: Date.now() - 300 },
        { type: 'mouse_move', data: { speed: 1.3 }, timestamp: Date.now() - 200 },
        { type: 'mouse_move', data: { speed: 1.4 }, timestamp: Date.now() - 100 }
    ];

    try {
        console.log('Predicting anomaly score for mock sequence...');
        const score = await lstmModel.predictSequence(mockEvents);
        console.log(`Verification Result: Score = ${score}`);
        
        if (typeof score === 'number' && score >= 0 && score <= 1) {
            console.log('SUCCESS: Model successfully processed the sequence and returned a valid score.');
        } else {
            console.error('FAILURE: Model returned an invalid score.');
        }
    } catch (err) {
        console.error('VERIFICATION ERROR:', err);
    }
}

testPrediction();
