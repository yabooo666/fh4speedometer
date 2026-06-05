(function() {
    // Only run if not in FiveM environment
    if (!window.invokeNative) {
        console.log("[Speedometer Demo] Running in browser environment. Initializing simulator...");

        function initDemo() {
            document.body.style.backgroundColor = "#111216";
            document.body.style.backgroundImage = "radial-gradient(circle, #1e2029 0%, #0f1013 100%)";
            document.body.style.color = "#ffffff";
            document.body.style.margin = "0";
            document.body.style.overflow = "hidden";
            
            // Add a small helper text to let the user know they are in demo mode
            const infoText = document.createElement("div");
            infoText.style.position = "fixed";
            infoText.style.top = "20px";
            infoText.style.left = "20px";
            infoText.style.fontFamily = "sans-serif";
            infoText.style.fontSize = "14px";
            infoText.style.color = "rgba(255, 255, 255, 0.4)";
            infoText.style.pointerEvents = "none";
            infoText.innerHTML = `
                <h3 style="margin: 0 0 5px 0; color: #3ff9a5;">Speedometer Demo Viewer</h3>
                <p style="margin: 0;">Simulating engine RPM, gear shifting, fuel consumption, lights, and indicators.</p>
            `;
            document.body.appendChild(infoText);
        }

        // Initialize simulation loop once DOM is fully ready and jQuery is available
        function startSimulation() {
            let rpm = 0.8; // Initial idle RPM (800 RPM / 9000 RPM)
            let speed = 0.0;
            let gear = 1;
            let fuel = 100.0;
            let indicators = 'off';
            let enginehp = 1000.0;
            let lights = 0;
            let stopTicks = 0;
            let mileage = 12345.67;
            
            let accelerating = true;
            let gearRatio = [0, 3.8, 2.6, 1.8, 1.4, 1.0, 0.8]; // Simple gear ratios to simulate RPM drop/speed gain

            setInterval(() => {
                // Simulate gear shifting and speed acceleration
                if (accelerating) {
                    // Accelerate
                    speed += (gearRatio[gear] * 0.8);
                    
                    // Calculate RPM based on speed and gear ratio
                    let targetRpm = (speed / (gear * 40)) + 0.8;
                    if (targetRpm > 8.5) {
                        targetRpm = 8.5;
                        // Shift up!
                        if (gear < 6) {
                            gear++;
                            // Speed keeps moving, but RPM drops immediately
                            rpm = 4.0; 
                        } else {
                            // Max speed reached, start coasting/decelerating
                            accelerating = false;
                        }
                    } else {
                        // Smoothly transition RPM
                        rpm = rpm * 0.7 + targetRpm * 0.3;
                    }
                } else {
                    // Decelerate/Coast
                    speed -= 1.2;
                    let targetRpm = (speed / (gear * 40)) + 0.8;
                    
                    if (targetRpm < 2.0 && gear > 1) {
                        // Shift down
                        gear--;
                        rpm = 6.0;
                    } else {
                        rpm = rpm * 0.7 + targetRpm * 0.3;
                    }

                    if (speed <= 0) {
                        speed = 0;
                        rpm = 0.8;
                        gear = 1;
                        
                        // Stay stopped for 30 ticks (1.5 seconds)
                        stopTicks++;
                        if (stopTicks >= 30) {
                            accelerating = true;
                            stopTicks = 0;
                        }
                    }
                }

                // Simulate fuel consumption
                fuel -= 0.03;
                if (fuel <= 0) {
                    fuel = 100.0;
                }

                // Simulate engine health state
                enginehp = 1000.0 - (speed * 0.5);

                // Cycle headlight states (0 = off, 1 = low beam, 2 = high beam)
                const cycle = Math.floor(Date.now() / 6000) % 3;
                lights = cycle;

                // Cycle indicator state
                const indCycle = Math.floor(Date.now() / 3000) % 4;
                const indStates = ['off', 'left', 'right', 'both'];
                indicators = indStates[indCycle];

                // Cycle handbrake state every 5 seconds
                const hbActive = (Math.floor(Date.now() / 5000) % 2 === 0);

                // Increment simulated mileage (speed is km/h, tick is 50ms: distance = speed * (50/3600000) = speed/72000)
                mileage += (speed / 72000.0);

                // Send NUI message to window
                window.postMessage({
                    ShowHud: true,
                    PlayerID: 1,
                    CurrentCarRPM: rpm / 9.0, // normalized 0.0 - 1.0 (9 is max UI RPM value)
                    CurrentCarSpeed: speed / 3.6, // m/s (UI translates via speed * 3.6)
                    CurrentCarKmh: Math.floor(speed),
                    CurrentCarMph: Math.floor(speed / 1.60934),
                    CurrentCarGear: gear,
                    CurrentCarIL: 0,
                    CurrentCarAcceleration: accelerating,
                    CurrentCarHandbrake: hbActive,
                    CurrentCarMileage: mileage,
                    CurrentCarABS: false,
                    CurrentCarLS_r: false,
                    CurrentCarLS_o: false,
                    CurrentCarLS_h: false,
                    currentcarFuel: fuel,
                    currentcarIndicators: indicators,
                    currentcarEngineHp: enginehp,
                    currentcarLights: lights
                }, "*");
            }, 50);
        }

        // Start initialization immediately if DOM is ready, otherwise register event listeners
        if (document.readyState === "complete" || document.readyState === "interactive") {
            initDemo();
            startSimulation();
        } else {
            document.addEventListener("DOMContentLoaded", initDemo);
            if (window.addEventListener) {
                window.addEventListener('load', startSimulation);
            } else {
                window.attachEvent('onload', startSimulation);
            }
        }
    }
})();
