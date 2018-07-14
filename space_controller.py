# -*- coding: utf-8 -*-
# vim: autoindent shiftwidth=4 expandtab textwidth=120 tabstop=4 softtabstop=4

import sys, json, os, math, sqlite3, datetime
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
        self.current_user = 0
        self.HELPER = 1
        self.CHILD = 2
        self.current_priv = 0
        self.current_name = ""
        self.max_votes = 0
        self.vote_mode = 0
        self.mainscreen_mode = 0
        self.terminal_mode = 0
        self.millionaire_server = SpaceServer(self)
        SpaceModel.create()
        SpaceModel().setController(self)
        return


    def db_connect(self):
        db = sqlite3.connect('space.db')
        cursor = db.cursor()
        return db, cursor


    def pollDisplay(self):
        return {
            "mode": self.mainscreen_mode
        }

    def pollTerminal(self):
        return {
            "mode": self.terminal_mode
        }


    def login(self, uid):
        db, cursor = self.db_connect()
        cursor.execute('''
            SELECT u.UserId, u.Name, u.Privilege
            FROM User AS u
            WHERE u.UID = {ui}
        '''.format(ui = uid))
        result = cursor.fetchone()
        db.close()
        if result == None:
            self.current_user = 0
            self.current_name = ""
            self.current_priv = 0
        else:
            self.current_user = result[0]
            self.current_name = result[1]
            self.current_priv = result[2]
            print("User " + self.current_name + " logged in")
        return True
    
    def logout(self):
        self.current_user = 0
        self.current_priv = 0
        self.current_name = ""
        return True

    def vote_config(self, count, mode):
        self.max_votes = count
        self.vote_mode = mode
        return True

    def vote(self, gungees):
        gungee_list = gungees.split('-')
        if self.vote_mode == 1:
            if self.current_priv == self.CHILD:
                db, cursor = self.db_connect()
                for i in range(self.max_votes):
                    if i < len(gungee_list):
                        cursor.execute('''
                            INSERT INTO Vote(GungeeId, UserId, VoteTime)
                            VALUES({gi}, {ui}, \"{vt}\")
                        '''.format(gi = int(gungee_list[i]), ui = self.current_user, 
                                vt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                        db.commit()
                db.close()
                print("Vote cast")
            else:
                print("Only children can vote!")
        else:
            print("It's not time to vote!")
        return True

    def register(self, uid, name, privilege):
        # Check if uid exists in User table, if not add to database.  If so, update name and privilege
        db, cursor = self.db_connect()
        cursor.execute('''
            SELECT u.UserId
            FROM User AS u
            WHERE u.UID = {ui}
        '''.format(ui = uid))
        result = cursor.fetchone()
        if result == None:
            # Add to database
            cursor.execute('''
                INSERT INTO User(UID, Name, Privilege)
                VALUES({ui}, \"{nm}\", {pv})
            '''.format(ui = uid, nm = name, pv = privilege))
            db.commit()
            db.close()
            print("User " + name + " (" + str(uid) + ") registered")
        else:
            # Update database
            cursor.execute('''
                UPDATE User
                SET Name = \"{nm}\", Privilege = {pv}
                WHERE User.UserId = {id}
            '''.format(nm = name, pv = privilege, id = result[0]))
            db.commit()
            db.close()
            print("User " + name + " (" + str(uid) + ") updated")
        return True

    def mainscreen(self, mode):
        if self.mainscreen_mode != mode:
            self.mainscreen_mode = mode
        return True



if __name__ == "__main__":
    app = QtGui.QApplication(sys.argv)
    window = SpaceController()
    window.show()
    sys.exit(app.exec_())