# -*- coding: utf-8 -*-
# vim: autoindent shiftwidth=4 expandtab textwidth=120 tabstop=4 softtabstop=4

import sys, json, os, math
from PyQt4 import QtGui, QtCore
from PyQt4.QtCore import Qt
from ui_space_controller import Ui_MainWindow
from httpserver import SpaceServer
from space_model import SpaceModel

class SpaceController(QtGui.QMainWindow, Ui_MainWindow):

    def __init__(self):
        QtGui.QMainWindow.__init__(self)
        Ui_MainWindow.__init__(self)
        self.setupUi(self)
        # Start server for display
        self.update_id = 0
        self.millionaire_server = SpaceServer(self)
        SpaceModel.create()
        SpaceModel().setController(self)
        return


    def pollDisplay(self):
        return {
            "update_id": self.update_id,
            "key": "value"
        }


    def doAction(self, arg1, arg2):
        
        return True


if __name__ == "__main__":
    app = QtGui.QApplication(sys.argv)
    window = SpaceController()
    window.show()
    sys.exit(app.exec_())