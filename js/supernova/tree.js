const TREE_TAB = [
    {title: "Main"},
    {title: "Quality of life"},
    {title: "Challenge"},
    {title: "Post-Supernova", unl() { return player.supernova.post_10 } },
    {title: "Quantum", unl() { return quUnl() } },
    {title: "Corruption", unl() { return player.dark.c16.first || hasInfUpgrade(8) } },
]

const CORRUPTED_TREE = ['s1']

const TREE_IDS = [
    [
        ['c'],
        ['qol1','','','','qu_qol1',''],
        ['chal1'],
        ['bs4','bs1','','qf1','','rad1'],
        ['qu0'],
        ['ct1'],
    ],[
        ['s1','m1','rp1','bh1','sn1'],
        ['qol2','qol3','qol4','qu_qol2','qu_qol3','qu_qol4','qu_qol5','qu_qol6'],
        ['chal2','chal4a','chal4b','chal3'],
        ['bs5','bs2','fn1','bs3','qf2','qf3','rad2','rad3'],
        ['qu1','qu2','qu3'],
        ['ct2','ct3','ct4','ct5','ct6'],
    ],[
        ['s2','m2','t1','d1','bh2','gr1','sn2'],
        ['qol5','qol6','qol7','','','qu_qol7','',''],
        ['chal4','chal7a'],
        ['fn4','fn3','fn9','fn2','fn5','qf4','rad4','rad5'],
        ['prim3','prim2','prim1','qu4','qc1','qc2','qc3'],
        ['ct8','ct9','ct10','ct7','ct11'],
    ],[
        ['s3','m3','gr2','sn3'],
        ['qol9','unl1','qol8','unl2','unl3','qu_qol8','qu_qol9','unl4'],
        ['chal5','chal6','chal7','chal8'],
        ['fn12','fn11','fn6','fn10','rad6',""],
        ['en1','qu5','br1'],
        ['ct15','ct12','ct16','ct13','ct14'],
    ],[
        ['s4','sn5','sn4'],
        ['','','','qu_qol8a'],
        [],
        ['','fn7','fn8','fn13'],
        ['qu6','qu7','qu8','qu9','qu10','qu11'],
        [],
    ],[
        [],
        ['qu_qol10','qu_qol11','qu_qol12'],
        [],
        [],
        [],
        [],
    ],
]

const CS_TREE = (()=>{
    let t = []
    for (let i in TREE_IDS) t.push(...TREE_IDS[i][5])
    return t
})()

var tree_canvas,tree_ctx,tree_update=true

const NO_REQ_QU = ['qol1','qol2','qol3','qol4','qol5',
'qol6','qol7','qol8','qol9','unl1',
'c','s2','s3','s4','sn3',
'sn4','t1','bh2','gr1','chal1',
'chal2','chal3','bs1','fn2','fn3',
'fn5','fn6','fn10']

const TREE_UPGS = {
    buy(x, auto=false) {
        if (tmp.sn.unl && (tmp.sn.tree_choosed == x || auto) && tmp.sn.tree_afford[x]) {
            if (this.ids[x].qf) player.qu.points = player.qu.points.sub(this.ids[x].cost).max(0)
            else if (this.ids[x].cs) player.dark.c16.shard = player.dark.c16.shard.sub(this.ids[x].cost).max(0)
            else player.supernova.stars = player.supernova.stars.sub(this.ids[x].cost).max(0)
            
            if (CS_TREE.includes(x)) player.dark.c16.tree.push(x)
            else player.supernova.tree.push(x)
            if (!auto) delete player.supernova.pin_req

            if (x == 'unl1') addQuote(6)
        }
        if (!auto && tmp.sn.tree_choosed == x && this.ids[x].reqDesc && !hasTree(x)) player.supernova.pin_req = x
    },
	buyAll() {
		let cont = true
		while (cont) {
			cont = false
			for (var [i, can] of Object.entries(tmp.sn.tree_afford)) {
				if (!can) continue
				this.buy(i, true)
				cont = true
			}
			if (cont) updateSupernovaTemp()
		}
	},
    ids: {
        c: {
            req() { return player.supernova.times.gte(1) },
            reqDesc: `1 Supernova.`,
            desc: `Start generating 0.2 Neutron Star per second.`,
            cost: E(0),
        },
        sn1: {
            branch: ["c"],
            desc: `Tickspeed affects Neutron Star gain at a reduced rate.`,
            evo_desc: [1,`Meditation boosts Neutron Stars.`],
            cost: E(10),
            effect() {
                let x = EVO.amt >= 2 ? expMult(player.evo.cp.level.add(1).root(4), 1.5) :  EVO.amt == 1 ? player.evo.cp.level.add(1).root(2) : player.build.tickspeed.amt.add(1).root(3)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn2: {
            branch: ["sn1"],
            desc: `Supernova boosts Neutron Star gain.`,
            cost: E(350),
            effect() {
                let sn = player.supernova.times
                if (!hasTree("qu4")) sn = sn.softcap(15,0.8,0).softcap(25,0.5,0)

                let x = E(2.05)
				if (hasTree("sn4")) x = x.add(treeEff("sn4", 0))
                return x.pow(sn)
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn3: {
            branch: ["sn2"],
            desc: `Blue stars boost Neutron star gain at a reduced rate.`,
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6 Supernovas.`,
            cost: E(50000),
            effect() {
                let x = player.stars.generators[4].max(1).log10().add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn4: {
            branch: ["sn3"],
            desc: `[sn2]'s effect base is increased by supernova.`,
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(13) },
            reqDesc: `13 Supernovas.`,
            cost: E(1e8),
            effect() {
                let x = player.supernova.times.mul(0.2).softcap(1.5,0.75,0)
                if (hasElement(112)) x = x.add(2)
                return x
            },
            effDesc(x) { return "+"+format(x)+(x.gte(1.5)?" <span class='soft'>(softcapped)</span>":"") },
        },
        sn5: {
            branch: ["sn4"],
            desc: `Mass boosts Neutron Stars gain.`,
            unl() { return quUnl() },
            cost: E('e1100'),
            effect() {
                let x = player.mass.add(1).log10().add(1).pow(2)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        m1: {
            branch: ["c"],
            desc: `Neutron star boosts Mass gain.`,
            cost: E(100),
            effect() {
                let x = E(1e100).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0)).min('ee100')
                let y = E(1)
                if (hasElement(164) || hasElement(219)) y = hasElement(219)
                ? Decimal.pow(1.25,player.supernova.stars.add(1).log10().add(1).log10().softcap(100,0.5,0))
                : player.supernova.stars.add(1).log10().add(1).log10().div(10).add(1)
                return [x,y]
            },
            effDesc(x) { return format(x[0])+"x"+(x[0].max(1).log(1e100).gte(1e3)?" <span class='soft'>(softcapped)</span>":"")+(hasElement(164)||hasElement(219)?", "+formatPow(x[1]):"") },
        },
        m2: {
            branch: ["m1"],
            desc: `Raise the Mass requirement for softcap^2 by 1.5`,
            cost: E(800),
        },
        m3: {
            branch: ["m2"],
            unl() { return player.supernova.fermions.unl && hasTree("fn1") },
            desc: `Mass gain softcap^2-3 starts later based on Supernovas.`,
            cost: E(1e31),
            effect() {
                let x = player.supernova.times.mul(0.0125).add(1)
                return x
            },
            effDesc(x) { return formatPow(x)+" later" },
        },
        t1: {
            branch: ["m1", 'rp1'],
            unl() { return EVO.amt < 1 },
            req() { return player.supernova.chal.noTick && player.mass.gte(E("1.5e60256")) },
            reqDesc() {return `Reach ${formatMass(E("1.5e60256"))} without buying Tickspeed in a Supernova run. You can still obtain Tickspeed from Cosmic Rays.`},
            desc: `Tickspeed Power is raised to the 1.15th.`,
            cost: E(1500),
        },
        rp1: {
            branch: ["c"],
            desc: `Neutron Stars boost Rage Powers gain.`,
            evo_desc: [1,`Neutron Stars boost calm powers gain.`],
            cost: E(200),
            effect() {
                if (EVO.amt >= 1) return hasElement(165) ? player.supernova.stars.add(1).log10().add(1).pow(2) : player.supernova.stars.add(1).log10().add(1).log10().add(1).pow(2)
                let x = hasElement(165)
                ? player.supernova.stars.add(1).log10().add(1).log10().div(10).add(1)
                : E(1e50).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return EVO.amt >= 1?formatMult(x):hasElement(165)?formatPow(x):(format(x)+"x"+(x.max(1).log(1e50).gte(1e3)?" <span class='soft'>(softcapped)</span>":"")) },
        },
        bh1: {
            branch: ["c"],
            desc: `Neutron Star boosts Dark Matters gain.`,
            evo_desc: [2,`Neutron Stars raise Wormholes.`],
            cost: E(400),
            effect() {
                let x = hasElement(166) || EVO.amt >= 2 ? player.supernova.stars.add(1).log10().add(1).log10().div(10).add(1)
                : E(1e35).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return hasElement(166)||EVO.amt>=2?formatPow(x):(format(x)+"x"+(x.max(1).log(1e35).gte(1e3)?" <span class='soft'>(softcapped)</span>":"")) },
        },
        bh2: {
            branch: ['bh1'],
            unl() { return EVO.amt < 2 },
            req() { return player.supernova.chal.noBHC && player.bh.mass.gte("1.5e1.07e4") },
            reqDesc() {return `Reach ${format("e1.07e4")} uni of black hole without buying any BH Condenser in a Supernova run.`},
            desc: `BH Condenser power is raised to the 1.15th.`,
            cost: E(1500),
        },
        s1: {
            branch: ["c"],
            desc: `Neutron Star boosts last star gain.`,
            cost: E(400),
            effect() {
                let x = player.supernova.stars.add(1).pow(2.5)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        s2: {
            branch: ["s1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3 Supernovas.`,
            desc: `Tetr amount to Star boost’s softcap is 50% weaker.`,
            cost: E(2500),
        },
        s3: {
            branch: ["s2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4 Supernovas.`,
            desc: `Star generators are stronger based on Supernova.`,
            cost: E(10000),
            effect() {
                let x = player.supernova.times.max(0).root(10).mul(0.1).add(1)
                return x
            },
            effDesc(x) { return formatPow(x) },
        },
        s4: {
            branch: ["s3"],
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6 Supernovas.`,
            desc: `Unlock Star Booster.`,
            cost: E(1e5),
        },
        qol1: {
            req() { return player.supernova.times.gte(2) },
            reqDesc: `2 Supernovas.`,
            desc: `Start with Silicon-14 & Argon-18 unlocked. You can now automatically buy Elements & Atom upgrades.`,
            cost: E(1500),
        },
        qol2: {
            branch: ["qol1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3 Supernovas.`,
            desc: `Keep Chromium-24 and Atom upgrades 3 & 6 on Supernova.`,
            cost: E(2000),
        },
        qol3: {
            branch: ["qol2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4 Supernovas.`,
            desc: `Start with technetium-43 unlocked, and it's improved. You can automatically gain Relativistic particles from mass.`,
            cost: E(10000),
        },
        qol4: {
            branch: ["qol3"],
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(12) },
            reqDesc: `12 Supernovas.`,
            desc: `You can now automatically buy Star unlockers & boosters.`,
            cost: E(1e8),
        },
        qol5: {
            branch: ["qol4"],
            req() { return player.supernova.times.gte(16) },
            reqDesc: `16 Supernovas.`,
            desc: `Tetr no longer resets anything.`,
            cost: E(1e13),
        },
        qol6: {
            branch: ["qol5"],
            req() { return player.supernova.times.gte(17) },
            reqDesc: `17 Supernovas.`,
            desc: `While in any challenge, you can now automatically complete it before exiting.`,
            cost: E(1e15),
        },
        qol7: {
            branch: ["qol6"],
            unl() { return player.supernova.fermions.unl && hasTree("fn2") },
            req() { return EVO.amt >= 2 || player.supernova.times.gte(21) },
            reqDesc() { return EVO.amt >= 2 ? `YOU CAN AFFORD BECAUSE OF EVOLUTION!` : `21 Supernovas.` },
            desc: `You can now automatically buy Photon & Gluon upgrades, they no longer spent their amount.`,
            cost: E(1e37),
        },
        qol8: {
            branch: ["unl1"],
            req() { return player.supernova.times.gte(29) },
            reqDesc: `29 Supernovas.`,
            desc: `You can now automatically Pent up, Pent no longer resets anything.`,
            cost: E(1e61),
        },
        qol9: {
            branch: ["unl1"],
            req() { return player.supernova.times.gte(32) },
            reqDesc: `32 Supernovas.`,
            desc: `You can now automatically buy Radiation Boosters, they no longer spent Radiation.`,
            cost: E(1e113),
        },
        chal1: {
            req() { return player.supernova.times.gte(4) },
            unl() { return EVO.amt < 3 },
            reqDesc: `4 Supernovas.`,
            desc: `Add 100 more C7 & C8 maximum completions.`,
            cost: E(6000),
        },
        chal2: {
            branch: ["chal1"],
            unl() { return EVO.amt < 2 },
            req() {
                for (let x = 1; x <= 4; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(E('e60400').mul(1.5e56))
            },
            reqDesc() { return `Reach ${format('e1.5e60456')} uni without challenge 1-4 completions in a Supernova run.` },
            desc: `Keep challenge 1-4 completions on reset.`,
            cost: E(1e4),
        },
        chal3: {
            branch: ["chal1"],
            req() {
                if (EVO.amt >= 2) return true
                for (let x = 5; x <= 8; x++) if (player.chal.comps[x].gte(1)) return false
                return player.bh.mass.gte(E('e7200').mul(1.5e56))
            },
            reqDesc() { return EVO.amt >= 2 ? `YOU CAN AFFORD BECAUSE OF EVOLUTION!` : `Reach ${format('e1.5e7256')} uni of black hole without challenge 5-8 completions in a Supernova run.` },
            desc: `Keep challenge 5-8 completions on reset.`,
            cost: E(1e4),
        },
        chal4: {
            unl() { return EVO.amt < 4 },
            get branch() { return EVO.amt >= 3 ? [] : EVO.amt >= 2 ? ["chal3"] : ["chal2","chal3"] },
            desc: `Unlock the 9th Challenge.`,
            cost: E(1.5e4),
        },
        chal4a: {
            unl() { return player.supernova.post_10 },
            branch: ["chal4"],
            desc: `Challenge 9’s effect is better.`,
            cost: E(1e8),
        },
        chal4b: {
            unl() { return quUnl() },
            branch: ["chal4"],
            desc: `Add 100 more C9 completions.`,
            cost: E('e25000'),
        },
        chal5: {
            branch: ["chal4"],
            desc: `Unlock the 10th Challenge.`,
            cost: E(1e17),
        },
        chal6: {
            unl() { return hasTree("unl1") },
            branch: ["chal5"],
            desc: `Unlock the 11th Challenge.`,
            cost: E(1e51),
        },
        chal7: {
            branch: ["chal6"],
            desc: `Unlock the 12th Challenge.`,
            get cost() { return EVO.amt >= 2 ? E(1e150) : E(1e235) },
        },
        chal7a: {
            unl() { return hasTree("unl3") },
            branch: ["chal7"],
            desc: `Challenge 12’s effect is better.`,
            cost: E('e900'),
        },
        chal8: {
            unl() { return player.qu.rip.first },
            branch: ["chal7"],
            desc: `Add 200 more C9-12 completions.`,
            cost: E('e35000'),
        },
        gr1: {
            branch: ["bh1"],
            unl() { return EVO.amt < 3 },
            desc: `BH Condensers power boost Cosmic Rays power.`,
            req() { return player.supernova.times.gte(7) },
            reqDesc: `7 Supernovas.`,
            cost: E(1e6),
            effect() {
                let x = BUILDINGS.eff('bhc','power').max(1).root(3)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        gr2: {
            unl() { return player.supernova.fermions.unl },
            branch: ["gr1"],
            desc: `Cosmic Rays Power is raised to 1.25th power.`,
            cost: E(1e20),
        },
        bs1: {
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(15) },
            reqDesc: `15 supernovas`,
            desc: `Tickspeed affects Higgs Boson gain at a reduced rate.`,
            cost: E(1e13),
            effect() {
                let x = player.build.tickspeed.amt.add(1).pow(0.6)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        bs2: {
            branch: ["bs1"],
            desc: `Photon, Gluon boosts each other's gain.`,
            cost: E(1e14),
            effect() {
                let x = overflow(expMult(player.supernova.bosons.photon,hasElement(113) ? 0.95 : 1/2,2).max(1),'ee60',0.5)
                let y = overflow(expMult(player.supernova.bosons.gluon,hasElement(113) ? 0.95 : 1/2,2).max(1),'ee60',0.5)
                return [x,y]
            },
            effDesc(x) { return format(x[1])+"x to Photon, "+format(x[0])+"x to Gluon" },
        },
        bs3: {
            branch: ["bs1"],
            desc: `Neutrons gain is affected by Graviton's effect at a reduced rate.`,
            cost: E(1e14),
            effect() {
                let x = tmp.sn.boson.effect.graviton[0].add(1).root(2)
                return x.softcap('e1000',1/3,0).softcap('ee38',0.95,2)
            },
            effDesc(x) { return format(x)+"x"+x.softcapHTML('e1000') },
        },
        bs4: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs2"],
            desc: `Raise Z Bosons gain and effect to the 1.5th power.`,
            cost: E(1e18),
        },
        bs5: {
            unl() { return player.qu.en.unl },
            branch: ["bs4"],
            desc: `Z Bosons also affect BHC + CR powers.`,
            cost: E('e1100'),
        },
        fn1: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs1"],
            desc: `Tickspeed affects Fermions gain at a reduced rate.`,
            evo_desc: [1,`Meditation affects Fermions gain at a reduced rate.`],
            cost: E(1e26),
            effect() {
                let x = EVO.amt >= 1 ? expMult(player.evo.cp.level.add(1), 2).pow(EVO.amt >= 2 ? 0.1 : 1) : E(1.25).pow(player.build.tickspeed.amt.softcap(1e24,0.5,2).pow(0.6))
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        fn2: {
            branch: ["fn1"],
            req() { return EVO.amt >= 3 || (player.mass.div('1.5e56').gte("e70000") && inMD() && FERMIONS.onActive("01")) },
            reqDesc() { return EVO.amt >= 3 ? `YOU CAN AFFORD BECAUSE OF A EVOLUTION!` : `Reach ${formatMass(E('e70000').mul(1.5e56))} while dilating mass in [Down]` },
            desc: `Unlock 2 more types of U-Quark & U-Fermion.`,
            cost: E(1e30),
        },
        fn3: {
            branch: ["fn1"],
            req() { return player.supernova.fermions.points[0].gte(1e7) || player.supernova.fermions.points[1].gte(1e7) },
            reqDesc() { return `Reach ${format(1e7)} of any Fermions` },
            desc: `Super fermion scaling is 7.5% weaker.`,
            cost: E(1e30),
        },
        fn4: {
            unl() { return hasTree("fn2") },
            branch: ["fn1"],
            desc: `2nd Photon & Gluon upgrades are slightly stronger.`,
            cost: E(3e34),
        },
        fn5: {
            unl() { return hasTree("fn2") },
            branch: ["fn1"],
            req() { return player.atom.quarks.gte("e1740") && FERMIONS.onActive("10") },
            reqDesc() { return `Reach ${format("e1740")} quarks while in [Electron]` },
            desc: `[Electron] max tier is increased by 35. Its effect softcap is weaker.`,
            cost: E(1e35),
        },
        fn6: {
            branch: ["fn2"],
            req() { return EVO.amt >= 3 || player.mass.gte(uni('e8e4')) && FERMIONS.onActive("02") && CHALS.inChal(5) },
            reqDesc() { return EVO.amt >= 3 ? `YOU CAN AFFORD BECAUSE OF A EVOLUTION!` : `Reach ${formatMass(uni("e8e4"))} while in [Charm] & Challenge 5.` },
            desc: `Unlock 2 more types of U-Quark & U-Fermion.`,
            cost: E(1e36),
        },
        fn7: {
            branch: ["fn6"],
            desc: `Unlock 2 more types of U-Quark & U-Fermion.`,
            cost: E(1e63),
        },
        fn8: {
            branch: ["fn7"],
            desc: `Unlock 2 final types of U-Quark & U-Fermion.`,
            cost: E(1e159),
        },
        fn9: {
            branch: ["fn1"],
            desc: `[Strange] & [Neutrino] max tier is increased by 2.`,
            cost: E(1e171),
        },
        fn10: {
            unl() { return PRIM.unl() },
            branch: ["fn5"],
            req() { return tmp.atom.unl && player.atom.points.gte("e1.5e8") && FERMIONS.onActive("10") && CHALS.inChal(9) },
            reqDesc() { return `Reach ${format("e1.5e8")} atoms while in [Electron] and 9th Challenge.` },
            desc: `Uncap [Electron] tier, its effect is overpowered.`,
            cost: E('e600'),
        },
        fn11: {
            unl() { return PRIM.unl() },
            branch: ["fn9"],
            desc: `[Strange], [Top], [Bottom], [Neutrino], [Neut-Muon] max tiers are increased by 5.`,
            cost: E('e680'),
        },
        fn12: {
            branch: ["fn3"],
            desc: `Pre-Ultra fermion scalings are 10% weaker.`,
            cost: E('e1120'),
        },
        d1: {
            unl() { return hasTree("fn6") },
            branch: ["rp1"],
            desc: `Generating Relativistic particles outside Mass dilation is 25% stronger.`,
            cost: E(1e38),
        },
        rad1: {
            unl() { return hasTree("unl1") },
            desc: `Gain more frequency based on Supernova, it will also multiply Radiations that is not the last available types.`,
            cost: E(1e41),
            effect() {
                let x = player.supernova.times.add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        rad2: {
            branch: ["rad1"],
            desc: `Gain 10x more all radiation types.`,
            cost: E(1e50),
        },
        rad3: {
            branch: ["rad1"],
            desc: `Radiation Boosts are 1.1x cheaper.`,
            cost: E(1e51),
        },
        rad4: {
            branch: ["rad2"],
            desc: `All Meta-Boosts are twice as effective.`,
            cost: E(1e115),
        },
        rad5: {
            branch: ["rad3"],
            desc: `All Radiation gains are increased by 100% for every Supernova you have become.`,
            cost: E(1e173),
            effect() {
                let x = E(2).pow(player.supernova.times)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        rad6: {
            unl() { return PRIM.unl() },
            branch: ["rad4"],
            desc: `Bonus radiation boosts are stronger based on radiation type.`,
            cost: E('e490'),
        },

        qf1: {
            unl() { return quUnl() },
            desc: `Gain more Quantum Foams based on Supernovas.`,
            cost: E('1e1150'),
            effect() {
                let x = player.supernova.times.root(2).div(10).add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qf2: {
            unl() { return PRIM.unl() },
            branch: ["qf1"],
            desc: `Quantum Foams are boosted by Neutron Stars.`,
            cost: E('e1235'),
            effect() {
                let x = player.supernova.stars.add(1).log10().add(1).root(3)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qf3: {
            unl() { return hasTree('unl3') },
            branch: ["qf1"],
            desc: `Quantum Foams are boosted by Blueprint Particles.`,
            cost: E('e1550'),
            effect() {
                let x = player.qu.bp.add(1).log10().add(1).pow(2)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qf4: {
            branch: ["qf3"],
            desc: `Quantum Shard's base is increased by 0.5.`,
            cost: E('e2000'),
        },

        // Quatnum

        qu0: {
            unl() { return quUnl() },
            qf: true,
            desc: `Good luck with the new era!`,
            cost: E(0),
        },
        qu1: {
            qf: true,
            branch: ["qu0"],
            desc: `Fermion requirements are decreased by 20%.`,
            cost: E(1),
        },
        qu2: {
            qf: true,
            branch: ["qu0"],
            desc: `W+ Boson's 1st effect is overpowered.`,
            cost: E(1),
        },
        qu3: {
            qf: true,
            branch: ["qu0"],
            desc: `BH formula's softcap is 30% weaker.`,
            cost: E(1),
        },
        qu4: {
            qf: true,
            branch: ["qu1", 'qu2', 'qu3'],
            desc: `Remove softcaps from [sn2]'s effect.`,
            cost: E(3),
        },
        qu5: {
            qf: true,
            unl() { return PRIM.unl() },
            branch: ['qu4'],
            desc: `Blueprint Particles & Chromas are affected by Tickspeed Effect at a reduced rate.`,
            cost: E(100),
            effect() {
                let x = BUILDINGS.eff('tickspeed','eff_bottom').add(1).log10().add(1).log10().add(1).pow(3)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qu6: {
            qf: true,
            branch: ['qu5'],
            desc: `Quantizes boost Cosmic string's power.`,
            cost: E(1e3),
            effect() {
                let x = player.qu.times.add(1).log10().add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qu7: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ['qu6'],
            desc: `Gain more Quantizes based on Quantum Shards.`,
            cost: E(1e15),
            effect() {
                let x = player.qu.qc.shard+1
                return x
            },
            effDesc(x) { return format(x,0)+"x" },
        },
        qu8: {
            qf: true,
            
            branch: ['qu7'],
            desc: `Chromas are affected by Quantum Shard’s effect.`,
            cost: E(1e21),
            effect() {
                let x = tmp.qu.qc.s_eff.max(1)
                return x
            },
            effDesc(x) { return format(x,1)+"x" },
        },
        qu9: {
            unl() { return player.qu.en.unl },
            qf: true,
            branch: ['qu8'],
            desc: `Gain more Quantizes based on total Primordium Particles.`,
            cost: E(1e24),
            effect() {
                let x = player.qu.prim.theorems.add(1)
                if (hasBeyondRank(2,17)) x = x.mul(beyondRankEffect(2,17)[0])
                return x
            },
            effDesc(x) { return format(x,0)+"x" },
        },
        qu10: {
            qf: true,
            branch: ['qu9'],
            desc: `Higgs Boson's effect is increased by 3.3% for every OoM of Blueprint Particles.`,
            cost: E(1e30),
            effect() {
                let x = E(1.0333).pow(player.qu.bp.add(1).log10().softcap(70,0.5,0))
                return overflow(x,'e450',0.5)
            },
            effDesc(x) { return format(x)+"x" },
        },
        qu11: {
            qf: true,
            branch: ['qu10'],
            desc: `Quantum Foams gain formula is better.`,
            cost: E(1e32),
        },
        qu_qol1: {
            qf: true,
            unl() { return quUnl() },
            req() { return player.qu.times.gte(4) },
            reqDesc: `Quantized 4 times.`,
            desc: `You now automatically purchase supernova tree upgrades as long as they don't cost quantum foam.`,
            cost: E(3),
        },
        qu_qol2: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 0; x < 6; x++) if (player.supernova.fermions.tiers[0][x].gte(1)) return false
                return player.supernova.times.gte(31)
            },
            reqDesc: `Become 31 Supernovas without getting tiers from U-Quark in Quantum run.`,
            desc: `Keep U-Quark Tiers on going Quantum.`,
            cost: E(4),
        },
        qu_qol3: {
            qf: true,
            unl() { return EVO.amt < 2 },
            branch: ["qu_qol1"],
            req() {
                for (let x = 1; x <= 4; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(mlt(1))
            },
            reqDesc() { return `Reach ${formatMass(mlt(1))} of mass without completing Challenges 1-4 in Quantum run.` },
            desc: `You can now automatically complete Challenges 1-4.`,
            cost: E(4),
        },
        qu_qol4: {
            qf: true,
            branch: ["qu_qol1"],
            desc: `You can now automatically become a supernova, it no longer resets anything.`,
            cost: E(4),
        },
        qu_qol5: {
            qf: true,
            unl() { return EVO.amt < 3 },
            branch: ["qu_qol1"],
            req() {
                for (let x = 5; x <= 8; x++) if (player.chal.comps[x].gte(1) && x != 7) return false
                return player.mass.gte(mlt(1))
            },
            reqDesc() { return `Reach ${formatMass(mlt(1))} of mass without completing Challenges 5, 6 & 8 in Quantum run.` },
            desc: `You can now automatically complete Challenges 5-8.`,
            cost: E(4),
        },
        qu_qol6: {
            qf: true,
            branch: ["qu_qol1"],
            req() {
                for (let x = 0; x < 6; x++) if (player.supernova.fermions.tiers[1][x].gte(1)) return false
                return player.supernova.times.gte(31)
            },
            reqDesc: `Become 31 Supernovas without getting tiers from U-Lepton in Quantum run.`,
            desc: `Keep U-Lepton Tiers on going Quantum.`,
            cost: E(4),
        },
        qu_qol7: {
            qf: true,
            get branch() { return EVO.amt >= 3 ? ["qu_qol4"] : EVO.amt >= 2 ? ["qu_qol5"] : ["qu_qol3","qu_qol5"] },
            req() {
                if (EVO.amt >= 1) return true
                for (let x = 9; x <= 12; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(mlt(1)) && FERMIONS.onActive("05")
            },
            reqDesc() { return EVO.amt >= 1 ? `YOU CAN AFFORD BECAUSE OF EVOLUTION!` : `Reach ${formatMass(mlt(5e3))} of mass without completing Challenges 9-12 in Quantum run, while in [Bottom].` },
            desc: `Keep challenge 9-12 completions on going Quantum.`,
            cost: E(25),
        },
        qu_qol8: {
            qf: true,
            branch: ["unl3"],
            req() { return player.qu.qc.shard >= 15 },
            reqDesc() { return `Get 15 Quantum Shards.` },
            desc: `You can now automatically get all Fermions Tiers outside any Fermion, except during Quantum Challenge.`,
            cost: E(1e11),
        },
        qu_qol8a: {
            unl() { return brokeDil() },
            qf: true,
            branch: ["qu_qol8"],
            desc: `[qu_qol8] now works in Quantum Challenge or Big Rip.`,
            cost: E(1e50),
        },
        qu_qol9: {
            qf: true,
            branch: ["qu_qol8"],
            req() { return player.qu.qc.shard >= 24 },
            reqDesc() { return `Get 24 Quantum Shards.` },
            desc: `Start with Polonium–84 unlocked when entering in Quantum Challenge.`,
            cost: E(1e17),
        },
        prim1: {
            qf: true,
            branch: ["qu5"],
            desc: `Primordium Theorem’s base requirement is reduced by 1.`,
            cost: E(200),
        },
        prim2: {
            qf: true,
            branch: ["prim1"],
            desc: `Theta Particle’s second effect is now added.`,
            cost: E(500),
        },
        prim3: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ["prim2"],
            desc: `Epsilon Particle’s second effect is now added, stronger if you are in Quantum Challenge.`,
            cost: E(1e16),
        },
        qc1: {
            qf: true,
            unl() { return hasTree("unl3") },
            branch: ['qu5'],
            desc: `Mass gain softcap^4 starts later based on Quantum Shards.`,
            cost: E(1e10),
            effect() {
                let x = (player.qu.qc.shard+1)**0.75
                return x
            },
            effDesc(x) { return formatPow(x)+" later" },
        },
        qc2: {
            unl() { return player.qu.en.unl },
            qf: true,
            branch: ['qc1'],
            req() { return tmp.qu.qc.s >= 70 && player.mass.gte(uni('e6e4')) && QCs.active() },
            reqDesc() { return `Reach ${formatMass(uni('e6e4'))} of mass with QS 70 build (before bonus from [qc2]).` },
            desc: `Get 1 extra shard when a nerf reaches 10.`,
            cost: E(1e27),
        },
        qc3: {
            unl() { return hasTree('unl4') },
            qf: true,
            branch: ['qc2'],
            req() { return player.qu.qc.shard >= 88 },
            reqDesc() { return `Get 88 Quantum Shards.` },
            desc: `Quantum Shard's base is increased by Prestige Base.`,
            cost: E(1e73),
            effect: () => E(tmp.prestiges.base||1).add(1).log10().div(10),
            effDesc(x) { return "+"+format(x) },
        },
        en1: {
            unl() { return player.qu.rip.first },
            qf: true,
            branch: ['qu5'],
            desc: `Evaporating frequency & mass of black hole is twice as effective, and its effects are stronger.`,
            cost: E(1e43),
        },
        br1: {
            unl() { return player.qu.rip.first },
            qf: true,
            branch: ['qu5'],
            req() { return tmp.qu.qc.s >= 79 && player.mass.gte(uni('e1.9e6')) && QCs.active() },
            reqDesc() { return `Reach ${formatMass(uni('e1.9e6'))} of mass with 79 QS build (before bonus from [qc2]).` },
            desc: `Quantum Shards boost Death Shard gain.`,
            cost: E(1e56),
            effect() {
                let x = (player.qu.qc.shard+1)**0.5
                return x
            },
            effDesc(x) { return formatMult(x) },
        },

        // Other

        unl1: {
            branch: ["qol7"],
            unl() { return hasTree("fn6") },
            req() { return EVO.amt >= 2 || player.supernova.times.gte(23) },
            reqDesc() { return EVO.amt >= 2 ? `YOU CAN AFFORD BECAUSE OF EVOLUTION!` : `23 Supernovas.` },
            desc: `Unlock Radiation.`,
            cost: E(1e39),
        },
        unl2: {
            qf: true,
            branch: ["qu_qol7"],
            req() { return player.qu.times.gte(20) },
            reqDesc: `Quantize 20 times.`,
            desc: `Unlock Primordium.`,
            cost: E(50),
        },
        unl3: {
            qf: true,
            branch: ["unl2"],
            req() { return player.qu.times.gte(200) },
            reqDesc: `Quantize 200 times.`,
            desc: `Unlock Quantum Challenge.`,
            cost: E(2500),
        },
        unl4: {
            qf: true,
            branch: ["qu_qol9"],
            req() { return player.qu.qc.shard >= 59 },
            reqDesc: `59 Quantum Shards.`,
            desc: `Unlock Big Rip.`,
            cost: E(1e38),
        },

        qu_qol10: {
            unl: ()=>quUnl(),

            qf: true,
            desc: `You can't gain Delta, Alpha, Omega & Sigma Particles from Primordium Theorem now. Instead, their amount is set to your total primordium theorems.`,
            cost: E(0),
        },
        qu_qol11: {
            branch: ["qu_qol10"],

            qf: true,
            desc: `You can't gain Phi & Epsilon Particles from Primordium Theorem now. Instead, their amount is set to your total primordium theorems.`,
            cost: E(0),
        },
        qu_qol12: {
            branch: ["qu_qol11"],

            qf: true,
            desc: `You can't gain Theta & Beta Particles from Primordium Theorem now. Instead, their amount is set to your total primordium theorems.`,
            cost: E(0),
        },

        fn13: {
            unl: ()=>tmp.chal13comp,

            branch: ["fn8"],
            desc: `Unlock 2 meta-types of U-Quark & U-Fermion.`,
            cost: E('e1.5e10'),
        },

        // Corrupted Tree
        ct1: {
            desc: `Best mass of black hole in C16 boosts normal mass gain.`,
            cost: E(10),

            effect() {
                let x = tmp.c16.best_bh_eff.add(1)
                return overflow(x,10,0.5)
            },
            effDesc(x) { return formatPow(x) },
        },
        ct2: {
            branch: ['ct1'],

            desc: `Best mass of black hole in C16 boosts bosonic resources gain.`,
            cost: E(50),

            effect() {
                let x = tmp.c16.best_bh_eff.add(1).pow(2)
                return x
            },
            effDesc(x) { return formatMult(x) },
        },
        ct3: {
            branch: ['ct1'],

            desc: `Best mass of black hole in C16 adds free fermion tiers.`,
            cost: E(50),

            req() { return tmp.c16.in && player.supernova.fermions.choosed == "06" && player.bh.mass.gte('e81') },
            reqDesc() { return `Reach ${formatMass('e81')} of black hole during C16 & [Meta-Quark].` },

            effect() {
                let x = tmp.c16.best_bh_eff.add(1).log10().mul(1.5)
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        ct4: {
            branch: ['ct1'],

            desc: `Best mass of black hole in C16 adds to the base of all matter's upgrade.`,
            cost: E(100),

            req() { return tmp.c16.in && player.bh.dm.gte(1e300) },
            reqDesc() { return `Reach ${format(1e300)} dark matters during C16.` },

            effect() {
                let p = hasPrestige(2,40), c = tmp.c16.in
                let x = tmp.c16.best_bh_eff.add(1).log10().div(c?8:30)
                if (p) x = x.mul(c?3:1.2)
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        ct5: {
            branch: ['ct1'],

            desc: `Neutronium-0 now affects Challenge 13 at a reduced rate.`,
            cost: E(100),

            effect() {
                let x = hasElement(237) ? expMult(tmp.qu.chroma_eff[2],0.5) : overflow(tmp.qu.chroma_eff[2],10,0.5).root(3)
                return x
            },
            effDesc(x) { return formatMult(x) },
        },
        ct6: {
            branch: ['ct1'],

            desc: `Mass overflow starts later based on best mass of black hole in C16.`,
            cost: E(300),

            req() { return tmp.c16.in && player.atom.atomic.gte(1e8) },
            reqDesc() { return `Reach ${format(1e8)} atomic powers during C16.` },

            effect() {
                let x = tmp.c16.best_bh_eff.add(1).pow(2)
                return overflow(x,10,0.5)
            },
            effDesc(x) { return formatPow(x)+" later" },
        },
        ct7: {
            branch: ['ct5'],

            desc: `Neutronium-0 now affects Challenge 14 at a reduced rate. (like [ct5])`,
            cost: E(1500),

            req() { return player.chal.comps[14]&&player.chal.comps[14].gte(750) },
            reqDesc() { return `Get ${format(750,0)} C14 completions.` },
        },
        ct8: {
            branch: ['ct2'],

            desc: `Keep pre-C16 tree on entering C16. Best mass of black hole in C16 boosts all radiation gains.`,
            cost: E(2500),

            effect() {
                let x = tmp.c16.best_bh_eff.add(1).pow(2)
                return x
            },
            effDesc(x) { return formatMult(x) },
        },
        ct9: {
            branch: ['ct3'],

            desc: `Best mass of black hole in C16 adds free radiation boosts.`,
            cost: E(5000),

            req() { return tmp.c16.in && player.supernova.fermions.choosed == "16" && player.bh.mass.gte('e400') && player.build.bhc.amt.lte(0) },
            reqDesc() { return `Reach ${formatMass('e400')} of black hole during C16 & [Meta-Lepton] without buying BH Condensers.` },

            effect() {
                let x = tmp.c16.best_bh_eff.root(3)
                return x.overflow('e300',0.25)
            },
            effDesc(x) { return "+"+format(x) },
        },
        ct10: {
            branch: ['ct4'],

            desc: `FSS Requirement is lower based on total corrupted shards.`,
            cost: E(5e4),

            effect() {
                let x = Decimal.pow(0.95,overflow(player.dark.c16.totalS.add(1).log10(),2,0.5).root(2))
                if (hasElement(241)) x = x.pow(2)
                return x
            },
            effDesc(x) { return formatReduction(x) },
        },
        ct11: {
            branch: ['ct6'],

            desc: `Mass of black hole overflow starts later based on best mass of black hole in C16. (weaker during C16)`,
            cost: E(1e6),

            req() { return tmp.c16.in && player.atom.atomic.gte(1e20) },
            reqDesc() { return `Reach ${format(1e20)} atomic powers during C16.` },

            effect() {
                let x = tmp.c16.best_bh_eff.add(1)
                x = tmp.c16.in ? x.root(4) : x.pow(3)
                x = overflow(x,10,0.5)
                x = tmp.c16.in ? x.root(3) : x.pow(2)
                return x
            },
            effDesc(x) { return formatPow(x)+" later" },
        },
        ct12: {
            branch: ['ct9'],

            desc: `Best mass of black hole in C16 adds free primordium particles.`,
            cost: E(5e7),

            req() { return tmp.c16.in && player.supernova.fermions.choosed == "06" && player.bh.mass.gte('e1960') && player.build.bhc.amt.lte(0) },
            reqDesc() { return `Reach ${formatMass('e1960')} of black hole during C16 & [Meta-Quark] without buying BH Condensers.` },

            effect() {
                let x = tmp.c16.best_bh_eff.root(2).overflow('e430',0.25)
                return x
            },
            effDesc(x) { return "+"+format(x) },
        },
        ct13: {
            branch: ['ct7'],

            desc: `Neutronium-0 now affects Challenge 15 at a reduced rate, like [ct5].`,
            cost: E(2.5e8),

            req() { return player.chal.comps[14]&&player.chal.comps[14].gte(940) },
            reqDesc() { return `Get ${format(940,0)} C14 completions.` },
        },
        ct14: {
            branch: ['ct11'],

            desc: `Dilated mass overflow starts later based on best mass of black hole in C16.`,
            cost: E(1e10),

            req() { return tmp.c16.in && player.atom.atomic.gte(1e144) },
            reqDesc() { return `Reach ${format(1e144)} atomic powers during C16.` },

            effect() {
                let x = tmp.c16.best_bh_eff.add(1).pow(2)
                return x
            },
            effDesc(x) { return formatPow(x)+" later" },
        },
        ct15: {
            branch: ['ct8'],

            desc: `Total corrupted shards boost matters gain.`,
            cost: E(2.5e10),

            effect() {
                let x = player.dark.c16.totalS.add(1).root(2)
                return x
            },
            effDesc(x) { return formatMult(x) },
        },
        ct16: {
            unl: ()=>tmp.ea.unl || tmp.epUnl,
            branch: ['ct10'],

            desc: `Best mass of black hole in C16 boosts Kaon & Pion gain.`,
            get cost() { return E(EVO.amt >= 3 ? 1e15 : EVO.amt >= 2 ? 1e12 : 5e16) },

            effect() {
                let x = tmp.c16.best_bh_eff.div(1e5).add(1).pow(2)
                return x
            },
            effDesc(x) { return formatMult(x) },
        },
    },
}

for (let i in CS_TREE) TREE_UPGS.ids[CS_TREE[i]].cs = true

const TREE_TYPES = (()=>{
    let t = {
        normal: [],
        qu: [],
        cs: [],
    }
    for (let x in TREE_UPGS.ids) {
        if (TREE_UPGS.ids[x].qf) t.qu.push(x)
        else if (TREE_UPGS.ids[x].cs) t.cs.push(x)
        else t.normal.push(x)
    }
    return t
})()

function hasTree(id) { return (player.supernova?.tree.includes(id) || player.dark.c16.tree.includes(id)) && !(tmp.c16.in && CORRUPTED_TREE.includes(id)) }

function treeEff(id,def=1) { return tmp.sn.tree_eff?.[id]||E(def) }

function updateTreeTemp() {
	let tsn = tmp.sn
	if (!tsn.unl) return

	let c16 = tmp.c16.in
    let no_req1 = hasInfUpgrade(0)
    let can_buy = !CHALS.inChal(19)
	let tree = player.supernova.tree.concat(player.dark.c16.tree)

    for (let i = 0; i < TREE_TAB.length; i++) {
        tsn.tree_afford2[i] = []
        for (let j = 0; j < tsn.tree_had2[i].length; j++) {
            let id = tsn.tree_had2[i][j]
            let t = TREE_UPGS.ids[id]

            let branch = t.branch||[]
            let unl = !t.unl||t.unl()
            let bought = tree.includes(id)
			let check = unl && can_buy && !bought
			if (check) {
				for (let x of branch) {
					if (!tree.includes(x)) {
						unl = false
						break
					}
				}
			}

            let req = false
			if (check) {
				let cs = CS_TREE.includes(id)
				if (!cs && no_req1) req = true
				if (cs && (tmp.inf_unl || OURO.unl)) req = true
				if (tmp.qu.mil_reached[1] && NO_REQ_QU.includes(id)) req = true
				if (!req) req = !t.req || t.req()
			}

            let can = unl && req && (t.qf?player.qu.points:t.cs?player.dark.c16.shard:player.supernova.stars).gte(t.cost)
            tsn.tree_loc[id] = i
            tsn.tree_unlocked[id] = unl
            tsn.tree_afford[id] = can
            if (can) tsn.tree_afford2[i].push(id)
            if (unl && t.effect) tsn.tree_eff[id] = t.effect()
        }
    }

    tsn.star_gain = SUPERNOVA.starGain()
}

function setupTreeHTML() {
    let tree_table = new Element("tree_table")
    let tree_tab_table = new Element("tree_tab_table")
	let table = ``
    let table2 = ``
    for (let j = 0; j < TREE_TAB.length; j++) {
        table2 += `
        <div style="width: 145px">
            <button onclick="tmp.sn.tree_tab = ${j}" class="btn_tab" id="tree_tab${j}_btn">${TREE_TAB[j].title}<b id="tree_tab${j}_notify" style="color: red"> [!]</b></button>
        </div>
        `
        table += `<div id="tree_tab${j}_div">`
        for (let i = 0; i < TREE_IDS.length; i++) {
            table += `<div class="tree_table_column">`
            for (let k = 0; k < TREE_IDS[i][j].length; k++) {
                let id = TREE_IDS[i][j][k]
                let u = TREE_UPGS.ids[id]

                let option = id == "" ? `style="visibility: hidden"` : ``
                let img = TREE_UPGS.ids[id]?`<img src="images/tree/${u.icon||id}.png">`:""
                table += `<button id="treeUpg_${id}" class="btn_tree" onclick="TREE_UPGS.buy('${id}'); tmp.sn.tree_choosed = '${id}'" ${option}>${img}</button>`
            }
            table += `</div>`
        }
        table += `</div>`
    }

	tree_table.setHTML(table)
    tree_tab_table.setHTML(table2)
}

function retrieveCanvasData() {
	let treeCanv = document.getElementById("tree_canvas")
	if (treeCanv===undefined||treeCanv===null) return false;
    tree_canvas = treeCanv
	tree_ctx = tree_canvas.getContext("2d")
	return true;
}

function resizeCanvas() {
	if (C16_ANI.canvas) {
		C16_ANI.canvas.width = C16_ANI.canvas.clientWidth
		C16_ANI.canvas.height = C16_ANI.canvas.clientHeight
	}
    if (!retrieveCanvasData()) return
	tree_canvas.width = tree_canvas.clientWidth
	tree_canvas.height = tree_canvas.clientHeight
}

function drawTreeHTML() {
    if (tmp.tab_name == "sn-tree") {
        if (tree_canvas.width == 0 || tree_canvas.height == 0) resizeCanvas()
        drawTree()
    }
}

function drawTree() {
	if (!retrieveCanvasData()) return;
	tree_ctx.clearRect(0, 0, tree_canvas.width, tree_canvas.height);
	for (let x in tmp.sn.tree_had2[tmp.sn.tree_tab]) {
        let id = tmp.sn.tree_had2[tmp.sn.tree_tab][x]
        let branch = TREE_UPGS.ids[id].branch||[]
        if (branch.length > 0 && tmp.sn.tree_unlocked[id]) for (let y in branch) if (tmp.sn.tree_unlocked[branch[y]]) {
			drawTreeBranch(branch[y], id)
		}
	}
}

function treeCanvas() {
    if (!retrieveCanvasData()) return
    if (tree_canvas && tree_ctx) {
        window.addEventListener("resize", resizeCanvas)

        tree_canvas.width = tree_canvas.clientWidth
        tree_canvas.height = tree_canvas.clientHeight
    }
}

const TREE_ANIM = ["Circle", "Square", "OFF"]
const CR = 5
const SR = 7.0710678118654755

function drawTreeBranch(num1, num2) {
    var start = document.getElementById("treeUpg_"+num1).getBoundingClientRect();
    var end = document.getElementById("treeUpg_"+num2).getBoundingClientRect();
    var x1 = start.left + (start.width / 2) - (document.body.scrollWidth-tree_canvas.width)/2;
    var y1 = start.top + (start.height / 2) - (window.innerHeight-tree_canvas.height);
    var x2 = end.left + (end.width / 2) - (document.body.scrollWidth-tree_canvas.width)/2;
    var y2 = end.top + (end.height / 2) - (window.innerHeight-tree_canvas.height);
    tree_ctx.lineWidth=10;
    tree_ctx.beginPath();
    let color = TREE_UPGS.ids[num2].qf?"#39FF49":"#00520b"
    let color2 = TREE_UPGS.ids[num2].qf?"#009C15":"#fff"
    tree_ctx.strokeStyle = player.supernova.tree.includes(num2)||player.dark.c16.tree.includes(num2)?color:tmp.sn.tree_afford[num2]?"#fff":"#333";
    tree_ctx.moveTo(x1, y1);
    tree_ctx.lineTo(x2, y2);
    tree_ctx.stroke();

    if (player.options.tree_animation != 2) {
        tree_ctx.fillStyle = player.supernova.tree.includes(num2)||player.dark.c16.tree.includes(num2)?color2:"#888";
        let tt = [tmp.tree_time, (tmp.tree_time+1)%3, (tmp.tree_time+2)%3]
        for (let i = 0; i < 3; i++) {
            let [t, dx, dy] = [tt[i], x2-x1, y2-y1]
            let [x, y] = [x1+dx*t/3, y1+dy*t/3]
            tree_ctx.beginPath();
            if (player.options.tree_animation == 1) {
                let a = Math.atan2(y1-y2,dx)-Math.PI/4
                tree_ctx.moveTo(x+SR*Math.cos(a), y-SR*Math.sin(a))
                for (let j = 1; j <= 3; j++) tree_ctx.lineTo(x+SR*Math.cos(a+Math.PI*j/2), y-SR*Math.sin(a+Math.PI*j/2))
            } else if (player.options.tree_animation == 0) {
                tree_ctx.arc(x, y, CR, 0, Math.PI*2, true);
            }
            tree_ctx.fill();
        }
    }
}

function changeTreeAnimation() {
    player.options.tree_animation = (player.options.tree_animation + 1) % 3;
}

function updateTreeHTML() {
    let c16 = tmp.c16.in, ch = tmp.sn.tree_choosed
    if (tmp.sn.tree_choosed == "") tmp.el.tree_desc.setHTML(``)
    else {
        let t_ch = TREE_UPGS.ids[ch]
        let req = CS_TREE.includes(ch) && (tmp.inf_unl || OURO.unl) ? "Require-free thanks to evolving!" : !t_ch.req || hasTree(ch) ? "" : `<span class="${t_ch.req()?"green":"red"}">${t_ch.reqDesc?" Requirement: "+(typeof t_ch.reqDesc == "function"?t_ch.reqDesc():t_ch.reqDesc):""}</span>`
        let desc = t_ch.desc
        if (t_ch.evo_desc && EVO.amt >= t_ch.evo_desc[0]) desc = desc.strike() + " " + t_ch.evo_desc[1]
        tmp.el.tree_desc.setHTML(
			`<div style="font-size: 12px; font-weight: bold;">
				${tmp.sn.tree_afford[ch] ? '<span class="green">(click to buy)</span>' : req != '' ? (player.supernova.pin_req == ch ? '<span class="yellow">(requirement pinned at top)</span>' : '<span class="yellow">(click to pin requirement)</span>') : ''}
				${req}
			</div>
            ${`<span class="sky"><b>[${tmp.sn.tree_choosed}]</b> ${desc}</span>`.corrupt(c16 && CORRUPTED_TREE.includes(tmp.sn.tree_choosed))}<br>
            <span>Cost: ${format(t_ch.cost,2)} ${t_ch.qf?'Quantum foam':t_ch.cs?'<span class="corrupted_text">Corrupted Shard</span>':'Neutron star'}</span><br>
            <span class="green">${t_ch.effDesc?"Currently: "+t_ch.effDesc(tmp.sn.tree_eff[tmp.sn.tree_choosed]):""}</span>
            `
        )
    }

    for (let i = 0; i < TREE_TAB.length; i++) {
        tmp.el["tree_tab"+i+"_btn"].setDisplay(TREE_TAB[i].unl?TREE_TAB[i].unl():true)
        tmp.el["tree_tab"+i+"_notify"].setDisplay(tmp.sn.tree_afford2[i].length>0)
        tmp.el["tree_tab"+i+"_div"].setDisplay(tmp.sn.tree_tab == i)
        if (tmp.sn.tree_tab == i) for (let x = 0; x < tmp.sn.tree_had2[i].length; x++) {
            let id = tmp.sn.tree_had2[i][x]
            let unl = tmp.sn.tree_unlocked[id]
            tmp.el["treeUpg_"+id].setVisible(unl)
            let bought = player.supernova.tree.includes(id)
            if (unl) tmp.el["treeUpg_"+id].setClasses(player.dark.c16.tree.includes(id) || c16 && CORRUPTED_TREE.includes(id) ? {btn_tree: true, corrupted: true, choosed: id == tmp.sn.tree_choosed} : {btn_tree: true, qu_tree: TREE_UPGS.ids[id].qf, locked: !tmp.sn.tree_afford[id], bought: bought, choosed: id == tmp.sn.tree_choosed})
        }
    }
}
