//
//  LoginViewController.swift
//  Banking_FTW
//
//  Created by user241217 on 7/25/23.
//

import UIKit

class LoginViewController: UIViewController {

    @IBOutlet weak var emailTextField: UITextField!
    @IBOutlet weak var passwordTextField: UITextField!
    @IBOutlet weak var loginButton: UIButton!
    @IBOutlet weak var createAccountButton: UIButton!

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBAction func loginButtonTapped(_ sender: UIButton) {
        // Get the email and password entered by the user
        guard let enteredEmail = emailTextField.text, let enteredPassword = passwordTextField.text else {
            // Handle missing email or password
            return
        }

        // Perform login validation here by comparing with the data in the database
        if DatabaseManager.shared.isValidUser(email: enteredEmail, password: enteredPassword) {
            emailTextField.text = ""
            passwordTextField.text = ""
            // Login successful, perform the segue to AccountViewController
            performSegue(withIdentifier: "LoginToAccountSegue", sender: enteredEmail)
        } else {
            // Invalid credentials, show an alert
            showInvalidCredentialsAlert()
        }
    }



    private func showInvalidCredentialsAlert() {
        let alert = UIAlertController(title: "Invalid Credentials", message: "Please check your email and password and try again.", preferredStyle: .alert)
        let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)
        alert.addAction(okAction)
        present(alert, animated: true, completion: nil)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "LoginToAccountSegue",
            let accountViewController = segue.destination as? AccountViewController,
            let userEmail = sender as? String {
            accountViewController.userEmail = userEmail
        }
    }
    
    @IBAction func createAccountButtonTapped(_ sender: UIButton) {
        // Handle create account button tap
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        guard let createAccountViewController = storyboard.instantiateViewController(withIdentifier: "CreateAccountViewController") as? CreateAccountViewController else {
            return
        }
        navigationController?.pushViewController(createAccountViewController, animated: true)
    }
}

