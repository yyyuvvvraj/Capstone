const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

const SEQUENCE_LENGTH = 10;
const NUM_FEATURES = 3;

// Define Model Architecture
const buildModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 32,
        inputShape: [SEQUENCE_LENGTH, NUM_FEATURES],
        returnSequences: false
    }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
        optimizer: tf.train.adam(0.005),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });
    return model;
};

// Generate Synthetic Data
function generateData(numNormal, numAnomaly) {
    const data = [];
    const labels = [];

    // Generate Normal Data (Label 0)
    for (let i = 0; i < numNormal; i++) {
        const seq = [];
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
            const typeCode = 1; // mouse_move
            // Normal speeds ~2 to 15
            const speed = Math.random() * 13 + 2;
            // Normal dt ~ 50 to 300ms
            const dt = Math.random() * 250 + 50;
            seq.push([typeCode, speed, dt]);
        }
        data.push(seq);
        labels.push(0);
    }

    // Generate Anomalous Data (Label 1)
    for (let i = 0; i < numAnomaly; i++) {
        const seq = [];
        for (let j = 0; j < SEQUENCE_LENGTH; j++) {
            const typeCode = 1;
            // Anomalous speeds ~30 to 100
            const speed = Math.random() * 70 + 30;
            // Anomalous dt ~ 5 to 50ms
            const dt = Math.random() * 45 + 5;
            seq.push([typeCode, speed, dt]);
        }
        data.push(seq);
        labels.push(1);
    }

    // Shuffle data
    const indices = Array.from({length: numNormal + numAnomaly}, (_, i) => i);
    indices.sort(() => Math.random() - 0.5);

    const shuffledData = [];
    const shuffledLabels = [];
    
    for (let idx of indices) {
        shuffledData.push(data[idx]);
        shuffledLabels.push(labels[idx]);
    }

    return { 
        x: tf.tensor3d(shuffledData, [shuffledData.length, SEQUENCE_LENGTH, NUM_FEATURES]),
        y: tf.tensor2d(shuffledLabels, [shuffledLabels.length, 1])
    };
}

async function runTraining() {
    console.log('Building model architecture...');
    const model = buildModel();

    console.log('Generating robust synthetic dataset...');
    const { x, y } = generateData(5000, 1500); // 5000 normal, 1500 anomalies

    console.log('Commencing model training...');
    await model.fit(x, y, {
        epochs: 10,
        batchSize: 64,
        validationSplit: 0.1,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}, val_acc = ${logs.val_acc?.toFixed(4) || 'N/A'}`);
            }
        }
    });

    console.log('Training complete! Exporting weights to file...');
    
    // Save weights into a JSON format to easily load into plain Node tfjs
    const weightsData = [];
    for (let w of model.getWeights()) {
        weightsData.push({
            shape: w.shape,
            data: Array.from(w.dataSync()) // Extract underlying typed array values
        });
    }

    const exportPath = path.resolve(__dirname, 'lstm_weights.json');
    fs.writeFileSync(exportPath, JSON.stringify(weightsData), 'utf-8');
    
    console.log(`Model successfully serialized and saved to ${exportPath}`);
    console.log('You now have a robust pre-trained LSTM engine ready for telemetry ingestion!');
    
    // Cleanup tensors
    x.dispose();
    y.dispose();
}

runTraining().catch(console.error);
