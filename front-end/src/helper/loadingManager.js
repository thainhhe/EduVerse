class LoadingManager {
    constructor() {
        this.listeners = [];
        this.activeRequests = 0;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    notify(event) {
        this.listeners.forEach((listener) => listener(event));
    }

    start() {
        if (this.activeRequests === 0) {
            this.notify({ type: "START" });
        }
        this.activeRequests++;
    }

    stop() {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            this.notify({ type: "STOP" });
        }
    }
}

export const loadingManager = new LoadingManager();
