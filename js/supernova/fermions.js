const FERMIONS = {
    onActive(id) {
        if (!tmp.sn.unl) return

        let i = player.supernova.fermions.choosed
        return i == id || (i[1] == '6' && i[0] == id[0])
    },
    gain(i) {
        if (!player.supernova.fermions.unl) return E(0)
        let x = E(10)
        let base = E(1.25).add(tmp.qu.prim.eff[5][0])
        if (hasTree("unl1")) x = x.mul(tmp.sn.rad.hz_effect)
        for (let j = 0; j < FERMIONS.types[i].length; j++) x = x.mul(base.pow(player.supernova.fermions.tiers[i][j]))
        if (hasTree("fn1") && tmp.sn) x = x.mul(treeEff("fn1"))

        if (tmp.dark.run) x = expMult(x,mgEff(4)[0])

        return x
    },
    backNormal() {
        if (player.supernova.fermions.choosed != "") {
            player.supernova.fermions.choosed = ""
            SUPERNOVA.reset(false,false,false,true)
        }
    },
    choose(i,x) {
        CONFIRMS_FUNCTION.switchF(i,x)
    },
    bonus(i,j) {
        let x = E(0)
        if (hasTree("prim3") && j < 6) x = x.add(tmp.qu.prim.eff[5][1].min(j>2&&!hasElement(172)?4:EINF))
        if (hasTree('ct3')) x = x.add(treeEff('ct3'))
        return x
    },
    fp() {
        let x = E(1)
        if (hasTree("qu1")) x = x.mul(1.2)
        if (QCs.active()) x = x.div(tmp.qu.qc.eff[2])
        return x
    },
    fp2() {
        let x = E(1)
        if (hasBeyondRank(2,7)) x = x.mul(beyondRankEffect(2,7))
        return x
    },
    metaFP() {
        let x = E(1)
        return x
    },
    getTierScaling(t, bulk=false, meta=false) {
        let x = t
        let fp = meta?E(1):tmp.sn.ferm.fp
        let fp2 = meta?E(1):tmp.sn.ferm.fp2
        if (bulk) {
            x = t.scaleEvery('fTier',true,[1,1,1,fp,fp2]).add(1).floor()
        } else {
            x = t.scaleEvery('fTier',false,[1,1,1,fp,fp2])
        }
        return x
    },
    getUnlLength(x) {
        let u = 2
        if (hasTree("fn2")) u++
        if (hasTree("fn6")) u++
        if (hasTree("fn7")) u++
        if (hasTree("fn8")) u++
        if (hasTree("fn13")) u++
        return u
    },
    names: ['quark', 'lepton'],
    sub_names: [["Up","Down","Charm","Strange","Top","Bottom",'Meta-Quark'],["Electron","Muon","Tau","Neutrino","Neut-Muon","Neut-Tau",'Meta-Lepton']],
    types: [
        [
            {
                unl: () => tmp.atom.unl,
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e30').pow(t.pow(1.25)).mul("e400")
                },
                calcTier() {
                    let res = player.atom.atomic
                    if (res.lt('e400')) return E(0)
                    let x = res.div('e400').max(1).log('e30').max(0).root(1.25)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.max(1).log(1.1).mul(t.add(1).pow(2))
                    return x
                },
                desc(x) {
                    return `Adds ${format(x,0)} free Cosmic Rays`
                },
                inc: "Atomic Powers",
                cons: "^0.6 to the exponent of Atomic Powers gain",
            },{
                unl: () => tmp.atom.unl,
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e20').pow(t.pow(1.25)).mul("e200")
                },
                calcTier() {
                    let res = player.md.particles
                    if (res.lt('e200')) return E(0)
                    let x = res.div('e200').max(1).log('e20').max(0).root(1.25)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = E(1e5).pow(i.add(1).log10().mul(t)).softcap("ee3",0.9,2)
                    return x
                },
                desc(x) {
                    return `x${format(x)} to Relativistic Particles gain`+(x.gte('ee3')?" <span class='soft'>(softcapped)</span>":"")
                },
                inc: "Relativistic Particle",
                cons: "The exponent of the RP formula is divided by 10",
            },{
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('ee3').pow(t.pow(1.5)).mul(uni("e36000"))
                },
                calcTier() {
                    let res = player.mass
                    if (res.lt(uni("e36000"))) return E(0)
                    let x = res.div(uni("e36000")).max(1).log('ee3').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().pow(1.75).mul(t.pow(0.8)).div(100).add(1).softcap(5,0.75,0).softcap(449,0.25,0)
                    return x
                },
                desc(x) {
                    return `Z<sup>0</sup> Boson's first effect is ${format(x.sub(1).mul(100))}% stronger`+(x.gte(5)?" <span class='soft'>(softcapped)</span>":"")
                },
                inc: "Mass",
                cons: "You are trapped in Mass Dilation, and it is twice as strong",
                isMass: true,
            },{
                maxTier() {
                    if (hasElement(142)) return EINF
                    let x = 15
                    if (hasTree("fn9")) x += 2
                    if (hasTree("fn11")) x += 5
                    return x
                },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e100').pow(t.pow(1.5)).mul("e1300")
                },
                calcTier() {
                    let res = EVO.amt >= 1 ? E(10).pow(player.evo.cp.points.root(2)) : player.rp.points
                    if (res.lt('e1300')) return E(0)
                    let x = res.div('e1300').max(1).log('e100').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.max(1).log10().add(1).mul(t).pow(0.9).add(1).softcap(1.5,0.1,0).softcap(5,1/10,0)
                    if (!hasElement(23,1)) x = x.min(6.5)
                    return x
                },
                desc(x) {
                    return `4th Photon & Gluon upgrades are ${format(x)}x stronger`+(x.gte(1.5)?" <span class='soft'>(softcapped)</span>":"")
                },
                get inc() { return EVO.amt >= 1 ? "10^CP^0.5" : "Rage Power" },
                cons: "You are trapped in Mass Dilation and Challenges 3-5",
            },{
                unl: () => tmp.atom.unl,
                maxTier() {
                    if (hasElement(156)) return EINF
                    let x = 30
                    if (hasTree("fn11")) x += 5
                    return x
                },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('ee3').pow(t.pow(1.5)).mul(uni(EVO.amt >= 2 ? 'e4e4' : 'e30000'))
                },
                calcTier() {
                    let res = player.md.mass
                    if (res.lt(uni(EVO.amt >= 2 ? 'e4e4' : 'e30000'))) return E(0)
                    let x = res.div(uni(EVO.amt >= 2 ? 'e4e4' : 'e30000')).max(1).log('ee3').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().div(500).mul(t).add(1)
                    return x.softcap(1.15,0.5,0).softcap(1.8,1/3,0)//.softcap(2,0.1,0)
                },
                desc(x) {
                    return `Radiation Boosters are ${format(x)}x cheaper`+(x.gte(1.15)?" <span class='soft'>(softcapped)</span>":"")
                },
                inc: "Dilated Mass",
                cons: "U-Quarks, Photons & Gluons do nothing",
                isMass: true,
            },{
                unl: () => EVO.amt == 0,
                maxTier() {
                    if (hasElement(173)) return EINF
                    let x = 10
                    if (hasTree("fn11")) x += 5
                    return x
                },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e5e8').pow(t.pow(2)).mul('e6e9')
                },
                calcTier() {
                    let res = !tmp.pass?BUILDINGS.eff('tickspeed','eff_bottom'):E(1)
                    if (res.lt('e6e9')) return E(0)
                    let x = res.div('e6e9').max(1).log('e5e8').max(0).root(2)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().pow(0.5).div(150).add(1).pow(t)
                    if (hasElement(213)) {
                        let y = expMult(t.add(1).pow(i.add(1).log10().add(1).log10()),0.8)
                        return x.max(y)
                    }
                    return x.min(500)//overflow(x,500,0.25)
                },
                desc(x) {
                    return `Meta-Tickspeed starts ${format(x)}x later`
                },
                inc: "Tickspeed Effect",
                cons: "Challenges are disabled",
            },{
                get base() { return EVO.amt >= 3 ? 1e2 : EVO.amt >= 1 ? 1e8 : 1e10 },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x, false, true)
                    return Decimal.pow(1.5,t).mul(this.base)
                },
                calcTier() {
                    let res = tmp.sn.ferm.prod[0]
                    if (res.lt(this.base)) return E(0)
                    let x = res.div(this.base).max(1).log(1.5).max(0)
                    return FERMIONS.getTierScaling(x, true, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().add(1).log10().div(200).mul(t.softcap(8,0.5,0)).add(1)
                    return x.softcap(15,hasPrestige(1,300)?0.55:0.5,0).overflow(1e8,1/3,0)
                },
                desc(x) {
                    return `Dark ray's effect is ^${x.format()} stronger`.corrupt(tmp.c16.in)
                },
                inc: "product of above u-quarks",
                cons: "All u-quarks at once, and force quantum reset.",
            },

        ],[
            {
                maxTier() {
                    if (hasTree("fn10")) return EINF
                    let x = 15
                    if (hasTree("fn5")) x += 35
                    return x
                },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e5').pow(t.pow(1.5)).mul("e175")
                },
                calcTier() {
                    let res = player.atom.quarks
                    if (res.lt('e175')) return E(0)
                    let x = res.div('e175').max(1).log('e5').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().mul(t).add(1).softcap(1.5,hasTree("fn5")?0.75:0.25,0)
                    if (hasTree("fn10")) x = x.pow(4.5)
                    return x//.softcap(1e18,0.1,0)
                },
                desc(x) {
                    return `Collapsed Stars gain softcap starts ^${format(x)} later`+(x.gte(1.5)?" <span class='soft'>(softcapped)</span>":"")
                },
                inc: "Quark",
                cons: "^0.625 to the exponent of Atoms gain",
            },{
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e5000').pow(t.pow(1.25)).mul("e48000")
                },
                calcTier() {
                    let res = EVO.amt >= 2 ? E(2).pow(player.evo.wh.fabric.sqrt()) : player.bh.mass
                    if (res.lt('e48000')) return E(0)
                    let x = res.div('e48000').max(1).log('e5000').max(0).root(1.25)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = t.pow(1.5).add(1).pow(i.add(1).log10().softcap(10,0.75,0)).softcap(1e6,0.75,0)
                    if (tmp.c16.in) x = overflow(x,1e100,0.5)
                    return x
                },
                desc(x) {
                    return `x${format(x)} to Higgs Bosons & Gravitons gain`+(x.gte(1e6)?" <span class='soft'>(softcapped)</span>":"")
                },
                get isMass() { return EVO.amt < 2 },
                get inc() { return EVO.amt >= 2 ? "2^Fabric^0.5" : "Mass of Black Hole" },
                cons: "The power from the mass of the BH formula is always -1",
            },{
                unl: () => EVO.amt == 0,
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e2e3').pow(t.pow(1.5)).mul("e1.8e5")
                },
                calcTier() {
                    let res = player.bh.dm
                    if (res.lt('e1.8e5')) return E(0)
                    let x = res.div('e1.8e5').max(1).log('e2e3').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = hasElement(17,1) ? t.pow(2).mul(i.add(1).log10().add(1)).add(1) : t.pow(0.8).add(1).pow(i.add(1).log10())
                    if (hasBeyondRank(4,40)) x = x.pow(3)
                    return x
                },
                desc(x) {
                    return `Tickspeed is ${format(x)}x cheaper (before Meta scaling)`
                },
                inc: "Dark Matter",
                cons: "You are trapped in Challenges 8-9",
            },{
                maxTier() {
                    if (hasElement(142)) return EINF
                    let x = 15
                    if (hasTree("fn9")) x += 2
                    if (hasTree("fn11")) x += 5
                    return x
                },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('e400').pow(t.pow(1.5)).mul("e1600")
                },
                calcTier() {
                    let res = player.stars.points
                    if (res.lt('e1600')) return E(0)
                    let x = res.div('e1600').max(1).log('e400').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let x = i.max(1).log10().add(1).mul(t).add(1).softcap(1.5,0.2,0)
                    return x
                },
                desc(x) {
                    return `Tier requirement is ${format(x)}x cheaper`+(x.gte(1.5)?" <span class='soft'>(softcapped)</span>":"")
                },
                inc: "Collapsed Star",
                cons: "Star generators are decreased to ^0.5",
            },{
                unl: () => tmp.atom.unl,
                maxTier() {
                    if (hasElement(156)) return EINF
                    let x = 25
                    if (hasTree("fn11")) x += 5
                    return x
                },
                nextTierAt(x) {
                    let evo = EVO.amt
                    let t = FERMIONS.getTierScaling(x)
                    return E('e1e7').pow(t.pow(2)).mul("e2e8").pow(evo >= 3 ? 1e-5 : evo >= 2 ? 1e-3 : 1)
                },
                calcTier() {
                    let evo = EVO.amt
                    let res = evo >= 3 ? E(2).pow(player.evo.proto.star.cbrt()) : player.atom.points
                    if (res.lt(evo >= 3 ? 'e3.5e3' : evo >= 2 ? 'e3.5e5' : 'e2e8')) return E(0)
                    let x = res.root(evo >= 3 ? 1e-5 : evo >= 2 ? 1e-3 : 1).div('e2e8').max(1).log('e1e7').max(0).root(2)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let m = i.add(1).log10().mul(t).root(4)
                    let x = hasCharger(3)
                    ?Decimal.pow(0.975,overflow(m.max(1).log10(),10,0.5))
                    :Math.min(hasElement(157)?m.div(150).add(1).softcap(5,0.5,0).pow(-1).toNumber():1,E(0.95).pow(m.softcap(27,0.5,0)).max(2/3).toNumber())
                    return x
                },
                desc(x) {
                    let w = formatReduction(x)
                    return hasCharger(3)?`Meta & Exotic Supernovas scale ${w} weaker`:`Pre-Hyper-Supernova Scalings are ${w} weaker`
                },
                get inc() { return EVO.amt >= 3 ? "2^Protostars^0.33" : "Atom" },
                cons: "U-Leptons, Z<sup>0</sup> bosons do nothing",
            },{
                unl: () => EVO.amt == 0,
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x)
                    return E('10').pow(t.pow(1.5)).mul('e50')
                },
                calcTier() {
                    let res = !tmp.pass?BUILDINGS.eff('tickspeed','power'):E(1)
                    if (res.lt('e50')) return E(0)
                    let x = res.div('e50').max(1).log('10').max(0).root(1.5)
                    return FERMIONS.getTierScaling(x, true)
                },
                eff(i, t) {
                    let c = hasCharger(7)
                    let x = c ? t.add(1).pow(i.add(1).log10().add(1).log10()) : i.add(1).log10().pow(0.75).div(100).add(1).pow(t.pow(0.75))
                    if (!c && tmp.c16.in) x = overflow(x,150,0.05)
                    return x
                },
                desc(x) {
                    return `Pre-Meta BH Condensers & Cosmic Rays are ${format(x)}x cheaper`
                },
                inc: "Tickspeed Power",
                cons: "Radiation Boosts are disabled",
            },{
                get base() { return EVO.amt >= 1 ? 1e6 : 1e11 },
                nextTierAt(x) {
                    let t = FERMIONS.getTierScaling(x, false, true)
                    return Decimal.pow(1.5,t).mul(this.base)
                },
                calcTier() {
                    let res = tmp.sn.ferm.prod[1]
                    if (res.lt(this.base)) return E(0)
                    let x = res.div(this.base).max(1).log(1.5).max(0)
                    return FERMIONS.getTierScaling(x, true, true)
                },
                eff(i, t) {
                    let x = i.add(1).log10().add(1).log10().div(2000).mul(t.softcap(8,0.5,0))
                    if (hasBeyondRank(2,2)) x = x.mul(8)
                    return x.softcap(20,hasPrestige(1,300)?0.55:0.5,0).overflow(1e9,1/3,0)
                },
                desc(x) {
                    return `Increase prestige base's exponent by ${format(x)}`
                },
                inc: "product of above u-leptons",
                cons: "All u-leptons at once, and force quantum reset.",
            },
        ],
    ],
    productF(i) {
        let s = E(1)
        for (let x = 0; x < 6; x++) s = s.mul(player.supernova.fermions.tiers[i][x].add(1))
        return s
    },
}

function setupFermionsHTML() {
    for (i = 0; i < 2; i++) {
        let new_table = new Element("fermions_"+FERMIONS.names[i]+"_table")
        let table = ""
        for (let x = 0; x < FERMIONS.types[i].length; x++) {
            let f = FERMIONS.types[i][x]
            let id = `f${FERMIONS.names[i]}${x}`
            table += `
            <button id="${id}_div" class="fermion_btn ${FERMIONS.names[i]}" onclick="FERMIONS.choose(${i},${x})">
                <b>[${FERMIONS.sub_names[i][x]}]</b><br>[<span id="${id}_tier_scale"></span>Tier <span id="${id}_tier">0</span>]<br>
                <span id="${id}_cur">Currently: X</span><br>
                Next Tier at: <span id="${id}_nextTier">X</span><br>
                (Increased by ${f.inc})<br><br>
                Effect: <span id="${id}_desc">X</span><br>
                On Active: ${f.cons}
            </button>
            `
        }
	    new_table.setHTML(table)
    }
}

function updateFermionsTemp() {
	if (tmp.sn.ferm == undefined) {
		tmp.sn.ferm = {
            ch: [0,0],
            gains: [E(0),E(0)],
            maxTier: [[],[]],
            tiers: [[],[]],
            effs:  [[],[]],
            bonuses: [[],[]],
        }
	}

    let tf = tmp.sn.ferm
    tf.prod = [FERMIONS.productF(0),FERMIONS.productF(1)]
    tf.ch = player.supernova.fermions.choosed == "" ? [-1,-1] : [Number(player.supernova.fermions.choosed[0]),Number(player.supernova.fermions.choosed[1])]
    tf.fp = FERMIONS.fp()
    tf.fp2 = FERMIONS.fp2()
    tf.meta_fp = FERMIONS.metaFP()
    for (let i = 0; i < 2; i++) {
        tf.gains[i] = FERMIONS.gain(i)

        for (let x = 0; x < FERMIONS.types[i].length; x++) {
            let f = FERMIONS.types[i][x]
			if (f.unl && !f.unl()) continue

            tf.bonuses[i][x] = FERMIONS.bonus(i,x)
            tf.maxTier[i][x] = typeof f.maxTier == "function" ? f.maxTier() : f.maxTier||EINF
            tf.tiers[i][x] = f.calcTier().min(tf.maxTier[i][x])
            tf.effs[i][x] = f.eff(player.supernova.fermions.points[i], (FERMIONS.onActive("04") && i == 0) || (FERMIONS.onActive("14") && i == 1) ? E(0) : player.supernova.fermions.tiers[i][x].add(tf.bonuses[i][x]).mul(i==1?radBoostEff(16):1).mul(i==0?radBoostEff(19):1))
        }
    }
}

function updateFermionsHTML() {
	let tf = tmp.sn.ferm
    let r = [
        [tmp.atom.unl ? player.atom.atomic : E(1), tmp.atom.unl ? player.md.particles : E(1), player.mass, EVO.amt >= 1 ? E(10).pow(player.evo.cp.points.root(2)) : player.rp.points, tmp.atom.unl ? player.md.mass : E(1), BUILDINGS.eff('tickspeed','eff_bottom'), tf.prod[0]],
        [player.atom.quarks, EVO.amt >= 2 ? E(2).pow(player.evo.wh.fabric.sqrt()) : player.bh.mass, tmp.bh.unl ? player.bh.dm : E(1), player.stars.points, EVO.amt >= 3 ? E(2).pow(player.evo.proto.star.cbrt()) : player.atom.points, BUILDINGS.eff('tickspeed','power'), tf.prod[1]]
    ]
    for (i = 0; i < 2; i++) {
        tmp.el["f"+FERMIONS.names[i]+"Amt"].setTxt(format(player.supernova.fermions.points[i],2)+" "+formatGain(player.supernova.fermions.points[i],tf.gains[i].mul(tmp.qu.speed)))
        let unls = FERMIONS.getUnlLength(i)
        for (let x = 0; x < FERMIONS.types[i].length; x++) {
            let f = FERMIONS.types[i][x]
            let unl = x < unls && (!f.unl || f.unl())
            let id = `f${FERMIONS.names[i]}${x}`
            let fm = f.isMass?formatMass:format

            tmp.el[id+"_div"].setDisplay(unl)

            if (unl) {
                let active = FERMIONS.onActive(i+""+x)
                tmp.el[id+"_div"].setClasses({fermion_btn: true, [FERMIONS.names[i]]: true, choosed: active})
                tmp.el[id+"_nextTier"].setTxt(fm(f.nextTierAt(player.supernova.fermions.tiers[i][x])))
                tmp.el[id+"_tier_scale"].setTxt(getScalingName('fTier', i, x))
                tmp.el[id+"_tier"].setTxt(format(player.supernova.fermions.tiers[i][x],0)+(Decimal.lt(tf.maxTier[i][x],EINF)?" / "+format(tf.maxTier[i][x],0):"") + (E(tf.bonuses[i][x]).gt(0)?" + "+tf.bonuses[i][x].format():""))
                tmp.el[id+"_desc"].setHTML(f.desc(fermEff(i, x)))

                tmp.el[id+"_cur"].setDisplay(active)
                if (active) {
                    tmp.el[id+"_cur"].setTxt(`Currently: ${fm(
                        r[i][x]
                    )}`)
                }
            }
        }
    }
}

function fermEff(x, y, def = 1) {
	return tmp.sn.ferm?.effs[x][y] ?? E(def)
}