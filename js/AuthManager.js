import { SERVER_BASE_URL } from "./Config";

class AuthManager {
    constructor() {

    }

    createGuestUser() {
        const requestOptions = {
            method: 'POST'
        };

        return fetch(`${SERVER_BASE_URL}/api/v1/signup/guest`, requestOptions)
            .then(response => {
                if (response.status == 200) {
                    return response.text();
                }

                return null;
            })
    }

    getMe(token) {
        const requestOptions1 = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': token
            },
        };

        return fetch(`${SERVER_BASE_URL}/api/v1/me`, requestOptions1)
            .then(response => {
                if (response.status === 200) return response.json();
                return null;
            });
    }
}

const authManager = new AuthManager()
export default authManager;