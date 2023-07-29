//
//  AccountViewController.swift
//  Banking_FTW
//
//  Created by user241217 on 7/25/23.
//
import UIKit

class AccountViewController: UIViewController {

    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var accountNumberLabel: UILabel!
    @IBOutlet weak var balanceLabel: UILabel!
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var depositButton: UIButton!
    @IBOutlet weak var withdrawButton: UIButton!

    var userEmail: String!

    override func viewDidLoad() {
        super.viewDidLoad()
        loadUserInfo()
    }

    private func loadUserInfo() {
        print(userEmail as Any)
            guard let loginEmail = userEmail,
                  let user = DatabaseManager.shared.getUser(email: loginEmail) else {
                print("Error retrieving user.")
                return
            }

        nameLabel.text = user.name
        accountNumberLabel.text = String(user.accountNumber)
        nameLabel.sizeToFit()
        accountNumberLabel.sizeToFit()
        print("loginEmail: ", loginEmail, " --- name: ", user.name, " --- acct#: ", String(user.accountNumber))
        amountTextField.text = ""


        // Get the most recent transaction for the user
        if let latestTransaction = DatabaseManager.shared.getMostRecentTransaction(email: loginEmail) {
            balanceLabel.text = String(format: "%.2f", latestTransaction.balance)
            balanceLabel.sizeToFit()
        } else {
            balanceLabel.text = "N/A"
        }
    }



    @IBAction func depositButtonTapped(_ sender: UIButton) {
        performTransaction(amount: getAmountFromTextField(), isDeposit: true)
    }

    @IBAction func withdrawButtonTapped(_ sender: UIButton) {
        performTransaction(amount: getAmountFromTextField(), isDeposit: false)
    }

    private func performTransaction(amount: Double, isDeposit: Bool) {
        guard let user = DatabaseManager.shared.getUser(email: userEmail) else {
            // Handle error or show an alert if user is not found
            return
        }

        let mostRecentTransaction = DatabaseManager.shared.getMostRecentTransaction(email: user.email)
        var updatedBalance = mostRecentTransaction?.balance ?? 0.0

        if isDeposit {
            updatedBalance += amount
            showAlertMessage(title: "Deposit Successful", message: "Your deposit of $\(amount) was successful!")
        } else {
            if amount > updatedBalance {
                // Handle insufficient balance
                showAlertMessage(title: "Insufficient Balance", message: "You do not have enough balance to make a withdrawal of $\(amount).")
                return
            }
            updatedBalance -= amount
            showAlertMessage(title: "Withdrawal Successful", message: "Your withdrawal of $\(amount) was successful!")
        }

        if DatabaseManager.shared.insertTransaction(email: userEmail, amount: amount, timestamp: Date(), balance: updatedBalance, isDeposit: isDeposit) {
            // Transaction insertion successful, update user info after successful transaction
            loadUserInfo()
        } else {
            // Transaction insertion failed, show an alert or handle the error as needed
            showAlertMessage(title: "Transaction Failed", message: "An error occurred while processing the transaction.")
        }
    }



    private func showAlertMessage(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)
        alert.addAction(okAction)
        present(alert, animated: true, completion: nil)
    }


    @IBAction func logoutButtonTapped(_ sender: UIButton) {
        // Simply dismiss this view controller to go back to the main screen (login screen)
        self.dismiss(animated: true, completion: nil)
    }

    private func getAmountFromTextField() -> Double {
        guard let amountText = amountTextField.text, let amount = Double(amountText) else {
            // Handle invalid amount or show an alert
            return 0
        }
        return amount
    }
}
