class DatingApp {
	constructor() {
		this.modal = null;
		this.form = null;
		this.isAuthenticated = false;
		this.authToken = localStorage.getItem('dating_auth_token');

		this.init();
	}

	init() {
		if (this.authToken) {
			this.checkAuthStatus();
		}

		this.bindEvents();
		this.setupModal();
	}

	bindEvents() {
		document.getElementById('signupBtn')?.addEventListener('click', () => this.openModal());

		document.getElementById('signupForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

		document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
				this.closeModal();
			}
		});

		document.getElementById('email')?.addEventListener('blur', (e) => this.validateEmail(e.target.value));
		document.getElementById('password')?.addEventListener('blur', (e) => this.validatePassword(e.target.value));
		document.getElementById('email')?.addEventListener('input', (e) => this.clearError('emailError'));
		document.getElementById('password')?.addEventListener('input', (e) => this.clearError('passwordError'));
	}

	setupModal() {
		this.modal = document.getElementById('signupModal');
		this.form = document.getElementById('signupForm');
	}

	openModal() {
		if (this.modal) {
			this.modal.classList.add('active');
			document.body.style.overflow = 'hidden';
			document.getElementById('email')?.focus();
		}
	}

	closeModal() {
		if (this.modal) {
			this.modal.classList.remove('active');
			document.body.style.overflow = '';
			this.resetForm();
		}
	}

	resetForm() {
		if (this.form) {
			this.form.reset();
			this.clearAllErrors();
			this.hideSuccessMessage();
		}
	}

	validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const inputElement = document.getElementById('email');

		if (!email) {
			this.showError('emailError', 'Email is required');
			inputElement.classList.add('error');
			return false;
		}

		if (!emailRegex.test(email)) {
			this.showError('emailError', 'Please enter a valid email address');
			inputElement.classList.add('error');
			return false;
		}

		this.clearError('emailError');
		inputElement.classList.remove('error');
		return true;
	}

	validatePassword(password) {
		const inputElement = document.getElementById('password');

		if (!password) {
			this.showError('passwordError', 'Password is required');
			inputElement.classList.add('error');
			return false;
		}

		if (password.length < 8) {
			this.showError('passwordError', 'Password must be at least 8 characters long');
			inputElement.classList.add('error');
			return false;
		}

		this.clearError('passwordError');
		inputElement.classList.remove('error');
		return true;
	}

	showError(elementId, message) {
		const errorElement = document.getElementById(elementId);
		if (errorElement) {
			errorElement.textContent = message;
		}
	}

	clearError(elementId) {
		const errorElement = document.getElementById(elementId);
		if (errorElement) {
			errorElement.textContent = '';
		}
	}

	clearAllErrors() {
		this.clearError('emailError');
		this.clearError('passwordError');
		document.getElementById('email')?.classList.remove('error');
		document.getElementById('password')?.classList.remove('error');
	}

	showSuccessMessage() {
		const modalHeader = document.getElementById('modalHeader');
		const successMessage = document.getElementById('successMessage');
		const form = document.getElementById('signupForm');

		if (successMessage && form) {
			modalHeader.style.display = 'none';
			form.style.display = 'none';
			successMessage.style.display = 'flex';
		}
	}

	hideSuccessMessage() {
		const successMessage = document.getElementById('successMessage');
		const form = document.getElementById('signupForm');

		if (successMessage && form) {
			successMessage.style.display = 'none';
			form.style.display = 'flex';
		}
	}

	async handleFormSubmit(e) {
		e.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		const isEmailValid = this.validateEmail(email);
		const isPasswordValid = this.validatePassword(password);

		if (!isEmailValid || !isPasswordValid) {
			return;
		}

		try {
			await this.authenticateUser(email, password);
		} catch (error) {
			try {
				await this.registerUser(email, password);
			} catch (registerError) {
				console.error('Registration failed:', registerError);
				this.showError('emailError', 'Registration failed. Please try again.');
			}
		}
	}

	async authenticateUser(email, password) {
		const credentials = btoa(`${email}:${password}`);
		const response = await fetch('https://api.dating.com/identity', {
			method: 'GET',
			headers: {
				'Authorization': `Basic ${credentials}`,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const token = response.headers.get('X-Token');
			if (token) {
				this.authToken = token;
				localStorage.setItem('dating_auth_token', token);
				this.isAuthenticated = true;
				this.redirectToAuthZone(token);
			}
		} else {
			throw new Error('Authentication failed');
		}
	}

	async registerUser(email, password) {
		const response = await fetch('https://api.dating.com/identity', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		});

		if (response.ok) {
			const token = response.headers.get('X-Token');
			if (token) {
				this.authToken = token;
				localStorage.setItem('dating_auth_token', token);
				this.isAuthenticated = true;
				this.showSuccessMessage();

				setTimeout(() => {
					this.redirectToAuthZone(token);
				}, 2000);
			}
		} else {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || 'Registration failed');
		}
	}

	async checkAuthStatus() {
		if (!this.authToken) return;

		try {
			const response = await fetch('https://api.dating.com/identity', {
				method: 'GET',
				headers: {
					'Authorization': `Basic ${this.authToken}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				this.isAuthenticated = true;
				this.redirectToAuthZone(this.authToken);
			} else {
				localStorage.removeItem('dating_auth_token');
				this.authToken = null;
				this.isAuthenticated = false;
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			localStorage.removeItem('dating_auth_token');
			this.authToken = null;
			this.isAuthenticated = false;
		}
	}

	redirectToAuthZone(token) {
		const redirectUrl = `https://www.dating.com/people/#token=${token}`;
		window.location.href = redirectUrl;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new DatingApp();
});
