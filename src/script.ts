/* eslint-disable no-console */

export default {
    start: function start() {
        const nAMESPACE = 'toasts';
        window[nAMESPACE] = { [nAMESPACE]: [] };

        if (window.sessionStorage?.removeItem) {
            window.sessionStorage.removeItem(nAMESPACE);
        }

        function pushToSessionStorage(toast: string) {
            if (!window.sessionStorage?.setItem) {
                return;
            }
            const rawData = window.sessionStorage.getItem(nAMESPACE);
            let parsed: Array<string>;
            if (rawData) {
                try {
                    parsed = JSON.parse(rawData) as Array<string>;
                } catch (error) {
                    throw new Error(
                        `Could not parse sessionStorage data: ${error.message as string}`
                    );
                }
            } else {
                parsed = [];
            }
            if (!parsed.includes(toast)) parsed.push(toast);
            window.sessionStorage.setItem(nAMESPACE, JSON.stringify(parsed));
        }

        function addToast(toast: string) {
            toast = toast.replaceAll(/\s{2,}/gi, ' ').replace(' ', '');

            if (!window[nAMESPACE].toasts.includes(toast)) window[nAMESPACE].toasts.push(toast);
            pushToSessionStorage(toast);
        }
        function getNotificationText() {
            const alerts = document?.querySelectorAll('sl-alert');
            alerts.forEach((alert) => {
                const testContext = alert?.textContent;
                if (testContext) {
                    addToast(testContext);
                }
            });
        }
        getNotificationText();
        setInterval(getNotificationText, 2500);

        console.log('Toast Interceptor started');
    },

    expectToast: (message?: string) => {
        // console.log('my message:', message);
        const nAMESPACE = 'toasts';

        function getFromSessionStorage() {
            const rawData = window.sessionStorage.getItem(nAMESPACE);
            let parsed;
            if (rawData) {
                try {
                    parsed = JSON.parse(rawData) as Array<string>;
                } catch (error) {
                    throw new Error(
                        `Could not parse sessionStorage data: ${error.message as string}`
                    );
                }
            }
            return parsed as Array<string>;
        }

        function removeToSessionStorage(toast: string) {
            if (!window.sessionStorage?.setItem) {
                return;
            }
            const rawData = window.sessionStorage.getItem(nAMESPACE);
            let parsed: Array<string>;
            if (rawData) {
                try {
                    parsed = JSON.parse(rawData) as Array<string>;
                } catch (error) {
                    throw new Error(
                        `Could not parse sessionStorage data: ${error.message as string}`
                    );
                }
            } else {
                parsed = [];
            }
            parsed = parsed.filter((item) => item !== toast);
            window.sessionStorage.setItem(nAMESPACE, JSON.stringify(parsed));
        }

        function removeToast(toast: string) {
            if (window[nAMESPACE]?.toasts) {
                window[nAMESPACE].toasts = window[nAMESPACE].toasts.filter(
                    (item) => item !== toast
                );
                removeToSessionStorage(toast);
            }
        }

        const toasts = window.sessionStorage
            ? getFromSessionStorage()
            : window[nAMESPACE].toasts;

        if (toasts) console.log(toasts);
        // Expect message
        if (message && message !== '') {
            if (toasts?.includes(message)) {
                removeToast(message);
                return [];
            }
            return false;
        }
        // Expect no error message
        if (
            toasts
    && (toasts.join(',').toLowerCase().includes('erreur')
      || toasts.join(',').toLowerCase().includes('impossible'))
    && !toasts.join(',').toLowerCase().includes('succès')
    && !toasts.join(',').toLowerCase().includes('clos')
    && !toasts
        .join(',')
        .toLowerCase()
        .includes('erreur lors de la récupération des messages')
    && !toasts
        .join(',')
        .toLowerCase()
        .includes('erreur pendant la création du token')
    && !toasts
        .join(',')
        .toLowerCase()
        .includes('impossible de finaliser votre die confidentiel') // INQA-1493
    && !toasts
        .join(',')
        .toLowerCase()
        .includes("erreur lors de l'enregistrement.") // #INQA-649
    && !toasts
        .join(',')
        .toLowerCase()
        .includes(
            'modification impossible, le nouvel identifiant existe déjà dans insight'
        ) // #INQA-1439
        ) {
            return toasts;
        }
        return [];
    },
};
