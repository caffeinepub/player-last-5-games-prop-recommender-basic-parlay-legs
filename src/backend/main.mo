import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import OutCall "http-outcalls/outcall";

actor {
  type GameStats = {
    points : Nat;
    rebounds : Nat;
    assists : Nat;
    threes : Nat;
  };

  type Game = {
    points : Nat;
    rebounds : Nat;
    assists : Nat;
    threes : Nat;
    date : Text;
    opponent : Text;
  };

  type PropRecommendation = {
    propType : Text;
    threshold : Nat;
    hits : Nat;
    total : Nat;
  };

  module PropRecommendation {
    public func compare(a : PropRecommendation, b : PropRecommendation) : Order.Order {
      Nat.compare(b.hits, a.hits);
    };
  };

  type PlayerStats = {
    playerName : Text;
    games : [Game];
  };

  let playerStats = Map.empty<Text, [GameStats]>();
  let last5Games = Map.empty<Text, [Game]>();
  let BALLDONTLIE_URL = "https://api.balldontlie.io/v1/";

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStatValue(game : GameStats, propType : Text) : Nat {
    switch (propType) {
      case ("points") { game.points };
      case ("rebounds") { game.rebounds };
      case ("assists") { game.assists };
      case ("threes") { game.threes };
      case (_) { 0 };
    };
  };

  public shared ({ caller }) func storeLast5Games(playerName : Text, games : [Game]) : async () {
    last5Games.add(playerName, games);
  };

  public query ({ caller }) func getLast5Games(playerName : Text) : async ?[Game] {
    last5Games.get(playerName);
  };

  public shared ({ caller }) func fetchLast5GamesAndStore(playerName : Text, games : [Game]) : async () {
    last5Games.add(playerName, games);
  };
};
