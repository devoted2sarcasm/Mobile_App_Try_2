//
//  HistoryViewController.swift
//  Banking_FTW
//
//  Created by user241217 on 7/29/23.
//

import SwiftUI
import UIKit

class TransactionHistoryViewController: UITableViewController {

    // Your other properties and methods

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "TransactionCell", for: indexPath) as! TransactionTableViewCell
        
        // Get the transaction for the current row
        let transaction = transactions[indexPath.row]

        // Customize the cell's labels with transaction data
        cell.amountLabel.text = "\(transaction.isDeposit ? "+" : "-") $\(transaction.amount)"
        cell.dateLabel.text = formatDate(transaction.timestamp)
        cell.typeLabel.text = transaction.isDeposit ? "Deposit" : "Withdrawal"

        // Customize any other labels or UI elements in the cell as needed
        
        return cell
    }

    // Your other methods
}
