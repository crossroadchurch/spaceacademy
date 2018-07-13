import subprocess, json

class SpaceModel(object):

    __instance__ = None

    def __new__(cls):
        """
        Re-implement the __new__ method to make sure we create a true singleton.
        """
        if not cls.__instance__:
            cls.__instance__ = object.__new__(cls)
        return cls.__instance__

    @classmethod
    def create(cls):
        model = cls()
        return model

    def setController(self, window):
        self.controller = window

    def pollDisplay(self):
        return self.controller.pollDisplay()

    def pollTablet(self):
        return self.controller.pollTablet()

    def login(self, uid):
        return self.controller.login(uid)

    def vote(self, gungees):
        return self.controller.vote(gungee)

    def vote_config(self, count, mode):
        return self.controller.vote_config(count, mode)

    def soundboard(self, id):
        return self.controller.soundboard(id)

    def mainscreen(self, mode):
        return self.controller.mainscreen(mode)

    def logout(self):
        return self.controller.logout(mode)

    def register(self, uid, name, privilege):
        return self.controller.register(uid, name, privilege)