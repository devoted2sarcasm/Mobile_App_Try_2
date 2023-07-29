//
//  TransactionTableViewCell.swift
//  Banking_FTW
//
//  Created by user241217 on 7/29/23.
//

import Foundation
import UIKit

import UIKit

class TransactionTableViewCell: UITableViewCell {
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var typeLabel: UILabel!

    // Add any other outlets you want to display in the cell

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
}
