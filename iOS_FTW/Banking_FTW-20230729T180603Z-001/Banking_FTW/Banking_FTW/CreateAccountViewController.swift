//
//  CreateAccountViewController.swift
//  Banking_FTW
//
//  Created by user241217 on 7/25/23.
//

import UIKit

class CreateAccountViewController: UIViewController {

    @IBOutlet weak var nameTextField: UITextField!
    @IBOutlet weak var emailTextField: UITextField!
    @IBOutlet weak var passTextField: UITextField!
    @IBOutlet weak var confirmTextField: UITextField!

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBAction func createAccountButtonTapped(_ sender: UIButton) {
        // Get the text entered in the text fields
        guard let name = nameTextField.text,
              let email = emailTextField.text,
              let password = passTextField.text,
              let confirmPassword = confirmTextField.text else {
            // Handle missing text in any of the fields
            return
        }

        // Check if passwords match
        if password == confirmPassword {
            // Passwords match, create a new account
            if DatabaseManager.shared.insertUser(name: name, email: email, password: password) {
                // Successfully created the user, now insert a deposit transaction with the initial balance
                if DatabaseManager.shared.insertTransaction(email: email, amount: 0.0, timestamp: Date(), balance: 0.0) {
                    // Account creation and initial transaction successful, navigate back to the login screen
                    navigationController?.popViewController(animated: true)
                } else {
                    // Failed to insert the initial transaction, show an alert
                    showAccountCreationFailedAlert()
                }
            } else {
                // Account creation failed, show an alert
                showAccountCreationFailedAlert()
            }
        } else {
            // Passwords do not match, show an alert
            showPasswordMismatchAlert()
        }
    }

    @IBAction func cancelButtonTapped(_ sender: UIButton) {
        // Handle cancel button tap to navigate back to the login screen
        navigationController?.popViewController(animated: true)
    }

    private func showAccountCreationFailedAlert() {
        let alert = UIAlertController(title: "Account Creation Failed", message: "An error occurred while creating your account. Please try again later.", preferredStyle: .alert)
        let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)
        alert.addAction(okAction)
        present(alert, animated: true, completion: nil)
    }

    private func showPasswordMismatchAlert() {
        let alert = UIAlertController(title: "Password Mismatch", message: "The entered passwords do not match. Please try again.", preferredStyle: .alert)
        let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)
        alert.addAction(okAction)
        present(alert, animated: true, completion: nil)
    }
}
