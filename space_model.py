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

    def doAction(self, arg1, arg2):
        return self.controller.doAction(arg1, arg2)