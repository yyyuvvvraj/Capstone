const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

const SEQUENCE_LENGTH = 10;
const NUM_FEATURES = 3;

// Initialize the sequential model
const model = tf.sequential();

// Add a 1D CNN layer to extract local temporal features (e.g., specific movement patterns)
model.add(tf.layers.conv1d({
    inputShape: [SEQUENCE_LENGTH, NUM_FEATURES],
    kernelSize: 3,
    filters: 32,
    strides: 1,
    activation: 'relu',
    padding: 'same'
}));

// Add the LSTM layer to capture long-term dependencies from the CNN features
model.add(tf.layers.lstm({
    units: 32,
    returnSequences: false
}));

// Add a dense layer for feature extraction
model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

// Final output layer producing a probability score between 0 and 1
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
});

// Load Pre-Trained Weights
const weightsPath = path.resolve(__dirname, 'lstm_weights.json');
try {
    if (fs.existsSync(weightsPath)) {
        console.log('Loading pre-trained robust CNN-LSTM engine weights...');
        const rawData = fs.readFileSync(weightsPath, 'utf8');
        const weightsData = JSON.parse(rawData);
        
        const tfWeights = weightsData.map(w => tf.tensor(w.data, w.shape));
        model.setWeights(tfWeights);
        console.log('CNN-LSTM engine initialized and ready.');
    } else {
        console.warn('WARNING: lstm_weights.json not found! Model is using untrained initialized weights.');
    }
} catch (e) {
    console.error('Failed to parse pre-trained LSTM weights', e);
}

/**
 * Preprocess a single telemetry event into a numeric feature array. Let's assume a generic format.
 * @param {Object} event Event object from telemetry route
 * @param {Number} prevEventTime Timestamp of the previous event to calculate dt
 * @returns {Array} A fixed-length numeric array representing the event
 */
function encodeEvent(event, prevEventTime) {
    let typeCode = 0;
    let val1 = 0;
    
    // We try to extract timestamp from event data if present, otherwise guess or 0
    let time = event.data?.timestamp || event.timestamp || Date.now();
    let dt = (prevEventTime > 0) ? time - prevEventTime : 0;
    
    if (event.type === 'mouse_move' || event.type === 'mousemove') {
        typeCode = 1;
        // speed might be sent in telemetry
        val1 = event.data?.speed || 0;
    } else if (event.type === 'keydown' || event.type === 'keyup') {
        typeCode = 2;
        // Key dwell times or flight times
        val1 = event.data?.dwellTime || event.data?.flightTime || 0;
    } else if (event.type === 'clipboard') {
        typeCode = 3;
    } else if (event.type === 'click') {
        typeCode = 4;
    }
    
    return [typeCode, parseFloat(val1) || 0, Math.min(dt, 5000)]; // Cap dt at 5000ms
}

/**
 * Predicts anomaly score for a sequence of events.
 * It takes an array of events (from a single session sequence) and
 * outputs a probability score where 1 is anomalous and 0 is normal.
 * 
 * @param {Array} events - Array of telemetry event objects 
 * @returns {Promise<Number>} Anomaly probability from 0.0 to 1.0
 */
async function predictSequence(events) {
    if (!events || events.length === 0) return 0;
    
    // Extract the most recent events of length SEQUENCE_LENGTH
    let sequence = events.slice(-SEQUENCE_LENGTH);
    let featuresList = [];
    let prevTime = 0;
    
    for (let ev of sequence) {
        let feat = encodeEvent(ev, prevTime);
        prevTime = ev.data?.timestamp || ev.timestamp || Date.now();
        featuresList.push(feat);
    }
    
    // Left-pad to SEQUENCE_LENGTH with zeros if fewer events were provided
    while (featuresList.length < SEQUENCE_LENGTH) {
        featuresList.unshift([0, 0, 0]); 
    }
    
    try {
        const tensor = tf.tensor3d([featuresList], [1, SEQUENCE_LENGTH, NUM_FEATURES]);
        const prediction = model.predict(tensor);
        
        // Wait for the synchronous tensor data slice
        const scoreArray = await prediction.data();
        
        // Cleanup memory to avoid memory leaks native to tfjs-node
        tensor.dispose();
        prediction.dispose();
        
        const finalScore = scoreArray[0];
        console.log(`CNN-LSTM Anomaly Score Evaluated: ${finalScore}`);
        return finalScore;
    } catch (err) {
        console.error('LSTM Prediction Error:', err);
        return 0; // Fallback on prediction error
    }
}

module.exports = {
    predictSequence
};
